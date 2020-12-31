import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script type="text/javascript">
            {
              `
                var _hmt = _hmt || [];
                (function() {
                  var hm = document.createElement('script');
                  hm.src = 'https://hm.baidu.com/hm.js?984a14f3e0e615ff993c5631e3c3e660';
                  var s = document.getElementsByTagName('script')[0];
                  s.parentNode.insertBefore(hm, s);
                })();
              `
            }
          </script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
