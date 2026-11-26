function rankScale(rank, maxRank, palette) {
    const colourStops = [];
    const colourLength = palette.length;
    const colourWidth = 100 / colourLength; // 10 deciles, 10 width each

    for (let index = 0; index < colourLength; index += 1) {
        const colour = palette[index];
        const start = index * colourWidth;
        const end = start + colourWidth;
        colourStops.push(`${colour} ${start}% ${end}%`);
    }

    const background = `linear-gradient(to right, transparent calc(100% - 1px), #8f8f8f calc(100% - 1px)) 0 0 
    / ${colourWidth}% 100%, linear-gradient(to right, ${colourStops.join(', ')})`;    
    const rankPosition = maxRank > 1 ? ((rank - 1) / (maxRank - 1)) * 100 : 0;

    const scaleLabels = `
        <div class="rank-scale-labels" aria-hidden="true">
            <span>← 1 (Most deprived)</span>
            <span>Rank</span>
            <span>(Least deprived) ${maxRank} →</span>
        </div>`;

return `
    <div class="rank-scale-wrapper" role="img" aria-label="Rank ${rank} of ${maxRank}">
        <div class="rank-scale" style="background: ${background};">
            <span class="rank-scale-marker" style="left: ${rankPosition}%;" aria-hidden="true"></span>
        </div>
        ${scaleLabels}
    </div>`;
}