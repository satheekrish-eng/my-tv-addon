// Nuvio Mallumv Plugin Code
(function() {
    return {
        name: "MalluMV Wiki Malayalam",
        async getStreams(movieTitle) {
            const streams = [];
            const BASE_URL = "https://mallumv.wiki";
            try {
                const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(movieTitle)}`;
                const response = await fetch(searchUrl);
                const html = await response.text();

                const pageRegex = new RegExp(`href="([^"]+mallumv\\.wiki/[^"]+)"[^>]*>[^<]*${movieTitle}[^<]*`, 'i');
                const match = html.match(pageRegex);

                if (match && match[1]) {
                    const moviePageUrl = match[1];
                    const pageResponse = await fetch(moviePageUrl);
                    const pageHtml = await pageResponse.text();

                    const downloadLinkRegex = /href="([^"]+(?:gofile\.io|pixeldrain\.com|links\.)[^"]+)"/gi;
                    let linkMatch;
                    let count = 1;

                    while ((linkMatch = downloadLinkRegex.exec(pageHtml)) !== null) {
                        let actualLink = linkMatch[1];
                        if (actualLink.startsWith('http')) {
                            streams.push({
                                name: `MalluMV Wiki Server ${count}`,
                                title: `${movieTitle}\nHost: ${new URL(actualLink).hostname}`,
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
