url <- "https://github.com/NISRA-Tech-Lab/dashboard-template"
tf <- fs::file_temp()
fs::dir_create(tf)

system2(
  "git", c("clone", url, tf)
)

files <- fs::dir_ls(tf, glob = "**/assets/*", recurse = TRUE, type = "file")

lapply(files, \(f) {
  folder <- fs::path_rel(fs::path_dir(f), tf)
  fs::dir_create(folder, recurse = TRUE)
  fs::file_copy(f, folder, overwrite = TRUE)
})
