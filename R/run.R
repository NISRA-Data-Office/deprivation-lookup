library(sf)
library(dplyr)
library(purrr)
library(stringr)
library(readxl)
library(jsonlite)

mdm_folder <- fs::path_expand("~/OneLake - Microsoft/data_office_deprivation")
lakehouse_file <- function(lakehouse, folder, ...) fs::path(mdm_folder, paste0(lakehouse, ".Lakehouse"), "Files", folder, ...)

workbook_path <- lakehouse_file("boundaries", "raw", "NIMDM17_SOAresults (2).xls")
soa_path <- lakehouse_file("boundaries", "raw", "SOA2011_Esri_Shapefile_0/SOA2011.shp")
cpd <- read_sf(lakehouse_file("cpd", "raw", "CPDJAN2026/POSTCODES_JAN2026.csv"))

# Urban/rural lookup: skip the 3 blank rows, row 4 becomes the headers
urban_rural_lookup <- read_excel(
  lakehouse_file("boundaries", "raw", "Settlement15-lookup.xls"),
  sheet = "SOA2011",   # your sheet name
  skip = 3
)

ur_code  <- str_subset(names(urban_rural_lookup), regex("^\\s*SOA\\s*code", ignore_case = TRUE))[1]
ur_value <- str_subset(names(urban_rural_lookup), regex("default\\s*urban", ignore_case = TRUE))[1]
stopifnot(!is.na(ur_code), !is.na(ur_value))

urban_rural_lookup <- urban_rural_lookup |>
  transmute(
    soa = toupper(trimws(as.character(.data[[ur_code]]))),
    settlement = trimws(as.character(.data[[ur_value]]))
  ) |>
  filter(!is.na(soa)) |>
  distinct(soa, .keep_all = TRUE)

soa <- read_sf(soa_path) |> st_make_valid()
code_col <- str_subset(names(soa), regex("^SOA.*code$|^SOA2001$", ignore_case = TRUE))[1]
name_col <- str_subset(names(soa), regex("label|name", ignore_case = TRUE))[1]

soa <- soa |> transmute(
  code = toupper(trimws(as.character(.data[[code_col]]))),
  label = str_squish(as.character(.data[[name_col]])))
stopifnot(!anyDuplicated(soa$code))

indicators <- map(setdiff(excel_sheets(workbook_path), "Metadata"), function(sheet) {
  data <- read_excel(workbook_path, sheet = sheet)
  rank_cols <- str_subset(names(data), regex("rank", ignore_case = TRUE))
  if (!length(rank_cols) || !"SOA2001" %in% names(data)) return(NULL)
  codes <- toupper(trimws(as.character(data$SOA2001)))
  map(rank_cols, \(col) list(
    name = str_squish(col), domain = sheet,
    rank = suppressWarnings(as.numeric(data[[col]]))[match(soa$code, codes)]))
}) |> list_flatten() |> compact() |>
  keep(\(x) (str_detect(x$name, regex("\\bdomain\\b", ignore_case = TRUE)) &
               !str_detect(x$name, regex("sub-?domain", ignore_case = TRUE))) |
         str_detect(x$name, regex("multiple deprivation", ignore_case = TRUE)))
indicators <- indicators[!duplicated(map_chr(indicators, "name"))]

# deprivation.json: indicator list + label and ranks per SOA
write_json(
  list(
    indicators = map(indicators, \(x) x[c("name", "domain")]),
    areas = setNames(
      map(seq_len(nrow(soa)), \(i) list(
        label = soa$label[i],
        ranks = map_dbl(indicators, \(x) x$rank[i])
      )),
      soa$code
    )
  ),
  "deprivation.json",
  auto_unbox = TRUE, na = "null"
)

# postcodes.json: settlement comes from the urban/rural lookup, joined on SOA
pc <- cpd |>
  st_drop_geometry() |>
  transmute(
    pc = toupper(PC5),
    soa = toupper(trimws(SOA2001)),
    lgd = toupper(trimws(LGD2014))
  ) |>
  filter(!is.na(pc), soa %in% .env$soa$code) |>
  distinct(pc, .keep_all = TRUE) |>
  left_join(urban_rural_lookup, by = "soa")

stopifnot(!all(is.na(pc$settlement)))
sum(is.na(pc$settlement))  # postcodes with no match

write_json(
  setNames(
    pmap(
      list(pc$soa, pc$lgd, pc$settlement),
      \(soa, lgd, settlement) c(soa, lgd, settlement)
    ),
    pc$pc
  ),
  "postcodes.json"
)

# soa.geojson: boundaries for map
soa |>
  st_transform(29902) |>
  st_simplify(preserveTopology = TRUE, dTolerance = 20) |>
  st_transform(4326) |>
  st_write("soa.geojson", delete_dsn = TRUE,
           layer_options = c("RFC7946=YES", "COORDINATE_PRECISION=5"))

## Checks
pcs <- read_json("postcodes.json")
dep <- read_json("deprivation.json")

check_pc <- function(p) {
  x <- pcs[[toupper(gsub(" ", "", p))]]

  if (is.null(x)) return("Not found")

  a <- dep$areas[[x[[1]]]]

  print(c(
    SOA = x[[1]],
    LGD = x[[2]],
    SETTLEMENT = x[[3]],
    label = a$label
  ))

  setNames(
    unlist(a$ranks),
    map_chr(dep$indicators, "name")
  )
}
check_pc("BT472JD")
check_pc("BT95BE")
