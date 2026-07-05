(function() {
    return {
        name: "MalluMV Wiki Malayalam",
        async getStreams(movieInfo) {
            const streams = [];
            const BASE_URL = "https://mallumv.wiki";
            
            // ആപ്പിൽ നിന്ന് വരുന്ന പേര് ഏത് രൂപത്തിലായാലും കൃത്യമായി ടെക്സ്റ്റ് ആക്കി മാറ്റുന്നു
            let movieTitle = "";
            if (movieInfo && typeof movieInfo === 'object') {
                movieTitle = movieInfo.title || movieInfo.name || "";
            } else if (typeof movieInfo === 'string') {
                movieTitle = movieInfo;
            }

            // വർഷം (2024) പോലുള്ളവ ഉണ്ടെങ്കിൽ ഒഴിവാക്കുന്നു
            movieTitle = movieTitle.replace(/\s*\(\d{4}\)/g, "").trim(); 

            if (!movieTitle) return streams;

            try {
                // 1. മാളൂഎംവിയിൽ സെർച്ച് ചെയ്യുന്നു
                const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(movieTitle)}`;
                const response = await fetch(searchUrl);
                const html = await response.text();

                // 2. മൂവി പേജ് ലിങ്ക് കണ്ടെത്തുന്നു
                const pageRegex = /href="([^"]+mallumv\.wiki\/[^"]+)"/gi;
                let pageMatch;
                let moviePageUrl = null;

                while ((pageMatch = pageRegex.exec(html)) !== null) {
                    if (pageMatch[1].toLowerCase().includes("movie") || pageMatch[1].includes(encodeURIComponent(movieTitle).toLowerCase())) {
                        moviePageUrl = pageMatch[1];
                        break;
                    }
                }

                if (!moviePageUrl) {
                    const fallbackRegex = new RegExp(`href="([^"]+mallumv\\.wiki/[^"]+)"`, 'i');
                    const fallbackMatch = html.match(fallbackRegex);
                    if (fallbackMatch) moviePageUrl = fallbackMatch[1];
                }

                // 3. മൂവി പേജിൽ നിന്ന് ലിങ്കുകൾ എടുക്കുന്നു
                if (moviePageUrl) {
                    const pageResponse = await fetch(moviePageUrl);
                    const pageHtml = await pageResponse.text();

                    // മാളൂഎംവിയിലെ പുതിയ ലിങ്ക് പാറ്റേണുകൾ എല്ലാം ഉൾപ്പെടുത്തുന്നു
                    const downloadLinkRegex = /href="([^"]+(?:gofile\.io|pixeldrain\.com|links\.|188x|drive|mirror|stream)[^"]+)"/gi;
                    let linkMatch;
                    let count = 1;

                    while ((linkMatch = downloadLinkRegex.exec(pageHtml)) !== null) {
                        let actualLink = linkMatch[1];
                        if (actualLink.startsWith('http')) {
                            let domain = new URL(actualLink).hostname.replace('www.', '');
                            streams.push({
                                name: `MalluMV [${domain}]`,
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
