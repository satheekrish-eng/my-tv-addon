(function() {
    return {
        name: "MalluMV Wiki Malayalam",
        async getStreams(movieInfo) {
            const streams = [];
            const BASE_URL = "https://mallumv.wiki";
            
            // ആപ്പിൽ നിന്നുള്ള സിനിമയുടെ പേര് എടുക്കുന്നു (വർഷം ഉണ്ടെങ്കിൽ അത് ഒഴിവാക്കി ലളിതമാക്കുന്നു)
            let rawTitle = movieInfo.title || movieInfo;
            let movieTitle = rawTitle.replace(/\s*\(\d{4}\)/g, "").trim(); 

            try {
                // 1. മാളൂഎംവി സൈറ്റിൽ സിനിമ സെർച്ച് ചെയ്യുന്നു
                const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(movieTitle)}`;
                const response = await fetch(searchUrl);
                const html = await response.text();

                // 2. സെർച്ച് റിസൾട്ടിൽ നിന്നും സിനിമയുടെ പേജ് ലിങ്ക് കണ്ടെത്തുന്നു
                const pageRegex = /href="([^"]+mallumv\.wiki\/[^"]+)"/gi;
                let pageMatch;
                let moviePageUrl = null;

                while ((pageMatch = pageRegex.exec(html)) !== null) {
                    if (pageMatch[1].toLowerCase().includes(encodeURIComponent(movieTitle).toLowerCase()) || pageMatch[1].includes("movie")) {
                        moviePageUrl = pageMatch[1];
                        break;
                    }
                }

                // ഒരുപക്ഷേ മുകളിലെ രീതിയിൽ കിട്ടിയില്ലെങ്കിൽ ആദ്യത്തെ ലിങ്ക് എടുക്കുന്നു
                if (!moviePageUrl) {
                    const fallbackRegex = new RegExp(`href="([^"]+mallumv\\.wiki/[^"]+)"[^>]*>[^<]*${movieTitle}[^<]*`, 'i');
                    const fallbackMatch = html.match(fallbackRegex);
                    if (fallbackMatch) moviePageUrl = fallbackMatch[1];
                }

                if (moviePageUrl) {
                    // 3. സിനിമയുടെ മെയിൻ പേജിലേക്ക് കയറി ലിങ്കുകൾ സ്ക്രാപ്പ് ചെയ്യുന്നു
                    const pageResponse = await fetch(moviePageUrl);
                    const pageHtml = await pageResponse.text();

                    // പേജിലുള്ള എല്ലാവിധ എക്സ്റ്റേണൽ ലിങ്കുകളും (Gofile, Pixeldrain, 188x, links. മുതലായവ) കണ്ടെത്തുന്നു
                    const downloadLinkRegex = /href="([^"]+(?:gofile\.io|pixeldrain\.com|links\.|188x|drive|mirror)[^"]+)"/gi;
                    let linkMatch;
                    let count = 1;

                    while ((linkMatch = downloadLinkRegex.exec(pageHtml)) !== null) {
                        let actualLink = linkMatch[1];
                        if (actualLink.startsWith('http')) {
                            let domainName = new URL(actualLink).hostname.replace('www.', '');
                            streams.push({
                                name: `MalluMV [${domainName}]`,
                                title: `${movieTitle}\nServer Link ${count}`,
                                url: actualLink
                            });
                            count++;
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
            return streams;
        }
    };
})();
