import AbstractSource from './abstract.js'



export default new class sukebei extends AbstractSource {

    url = atob('aHR0cHM6Ly9zdWtlYmVpLm55YWEuc2kv')



    /** @type {import('./').SearchFunction} */

    async single ({ anilistId, titles, episodeCount }) {

        if (!anilistId) throw new Error('No anilistId provided')

        if (!titles?.length) throw new Error('No titles provided')

    

        const res = await fetch(`${this.url}?f=0&c=1_0&q=${titles[0]}&p=1`)

        const html = await res.text()

    

        // Match all <tr> elements with the classes "default" or "success"

        const items = html.match(/<tr class="(default|success)"[\s\S]+?<\/tr>/g) || []

    

        return items.map(item => {

            // Extract the title

            const titleMatch = item.match(/title="([^"]+)">([^<]+)<\/a>/)

            const title = titleMatch ? titleMatch[2] : 'Unknown Title'

    

            // Extract the info hash from the magnet link

            const magnetMatch = item.match(/magnet:\?xt=urn:btih:([a-f0-9]{40})/)

            const infoHash = magnetMatch ? magnetMatch[1] : 'Unknown Hash'

    

            // Construct the full magnet link with additional parameters like tracker and display name

            const magnetLink = magnetMatch ? `magnet:?xt=urn:btih:${infoHash}&tr=http%3A%2F%2Fopen.nyaatorrents.info%3A6544%2Fannounce&dn=${encodeURIComponent(title)}` : 'Unknown Magnet Link'

    

            // Extract the size and convert it to bytes (B)

            const sizeMatch = item.match(/<td class="text-center">([\d\.]+) ([MGiB]+)<\/td>/)

            let size = 0

            if (sizeMatch) {

                const value = parseFloat(sizeMatch[1])

                const unit = sizeMatch[2]



                if (unit === 'GiB') {

                    size = value * 1073741824 // 1 GiB = 1073741824 B

                } else if (unit === 'MiB') {

                    size = value * 1048576 // 1 MiB = 1048576 B

                } else if (unit === 'MB') {

                    size = value * 1048576 // 1 MB = 1048576 B

                } else if (unit === 'GB') {

                    size = value * 1073741824 // 1 GB = 1073741824 B

                }

            }

    

            // Extract seeders, leechers, and date

            const statsMatch = item.match(/<td class="text-center"[^>]*>(\d+)<\/td>[^<]*<td class="text-center"[^>]*>(\d+)<\/td>[^<]*<td class="text-center">(\d+)<\/td>/)

            const seeders = statsMatch ? parseInt(statsMatch[1], 10) : 0

            const leechers = statsMatch ? parseInt(statsMatch[2], 10) : 0

            const dateMatch = item.match(/data-timestamp="(\d+)">([^<]+)<\/td>/)

            const date = dateMatch ? new Date(parseInt(dateMatch[1], 10) * 1000) : new Date()

    

            return {

                title,

                link: magnetLink, // Full magnet link with tracker and display name

                hash: infoHash,

                size,

                seeders,

                leechers,

                date,

                accuracy: high

            }

        })

    }



    /** @type {import('./types.js').SearchFunction} */

    async batch ({ anilistId, titles, episodeCount }) {

        return this.single({ anilistId, titles, episodeCount })

    }



    /** @type {import('./types.js').SearchFunction} */

    async movie ({ anilistId, titles }) {

        return this.single({ anilistId, titles, episodeCount: 1 })

    }

}()
