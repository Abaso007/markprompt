import { NextPageContext } from 'next';
import { Component } from 'react';

class Sitemap extends Component {
  static async getInitialProps({ res }: NextPageContext) {
    res?.setHeader('Content-Type', 'text/xml');
    res?.write(
      `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Markprompt Subprocessors</title><link>https://markprompt.com</link><description>Current Markprompt Subprocessors are published here</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate><atom:link href="https://markprompt/legal/subprocessors/rss.xml" rel="self" type="application/rss+xml"/><item><title>Google</title><link>https://markprompt.com/legal/subprocessors</link><guid>https://markprompt.com/legal/subprocessors</guid><description>Customers may choose to contact Markprompt via email. Markprompt uses Google as its primary email service provider. Markprompt does not require nor encourage disclosure of Personal Data via email, however the potential for Personal Data being transmitted to Markprompt remains.</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate></item><item><title>Nango</title><link>https://markprompt.com/legal/subprocessors</link><guid>https://markprompt.com/legal/subprocessors</guid><description>Markprompt uses Nango to synchronize data between customer sources and Markprompt.</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate></item><item><title>Resend</title><link>https://markprompt.com/legal/subprocessors</link><guid>https://markprompt.com/legal/subprocessors</guid><description>Markprompt uses Resend to send your transactional emails about our services.</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate></item><item><title>Stripe</title><link>https://markprompt.com/legal/subprocessors</link><guid>https://markprompt.com/legal/subprocessors</guid><description>Markprompt uses Stripe to process credit cards and payments.</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate></item><item><title>Supabase</title><link>https://markprompt.com/legal/subprocessors</link><guid>https://markprompt.com/legal/subprocessors</guid><description>Markprompt uses Supabase for data storage.</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate></item><item><title>Vercel</title><link>https://markprompt.com/legal/subprocessors</link><guid>https://markprompt.com/legal/subprocessors</guid><description>Markprompt uses Vercel for cloud computing and hosting.</description><pubDate>Tue, 26 Sep 2023 22:33:11 GMT</pubDate></item></channel></rss>`,
    );
    res?.end();
  }
}

export default Sitemap;
