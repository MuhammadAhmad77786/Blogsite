<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex, follow"/>
        <title>XML Sitemap</title>
        <style>
          body{font-family:system-ui,Segoe UI,Arial,sans-serif;background:#fbf4ea;color:#2a1a22;margin:0;padding:2rem}
          h1{font-family:Georgia,serif;color:#a81446;margin:0 0 .25rem}
          p{color:#6f5b64;margin:.25rem 0 1.25rem}
          table{border-collapse:collapse;width:100%;background:#fff;border-radius:10px;overflow:hidden}
          th,td{text-align:left;padding:.6rem .8rem;border-bottom:1px solid #ecdfd0;font-size:.9rem}
          th{background:#a81446;color:#fff}
          a{color:#a81446;text-decoration:none;word-break:break-all}
          a:hover{text-decoration:underline}
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <xsl:choose>
          <xsl:when test="sm:sitemapindex">
            <p>This index lists <strong><xsl:value-of select="count(sm:sitemapindex/sm:sitemap)"/></strong> sitemaps for search engines.</p>
            <table>
              <tr><th>Sitemap</th><th>Last modified</th></tr>
              <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                  <td><xsl:value-of select="substring(sm:lastmod,1,10)"/></td>
                </tr>
              </xsl:for-each>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <p>This sitemap contains <strong><xsl:value-of select="count(sm:urlset/sm:url)"/></strong> URLs.</p>
            <table>
              <tr><th>URL</th><th>Images</th><th>Last modified</th></tr>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                  <td><xsl:value-of select="count(image:image)"/></td>
                  <td><xsl:value-of select="substring(sm:lastmod,1,10)"/></td>
                </tr>
              </xsl:for-each>
            </table>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
