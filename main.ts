Deno.serve(async (req) => {
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString(); 

  // 1. 核心拦截：V2Board 会自动拼你的自定义路径过来，Deno 必须在这里对上暗号！
  if (!searchParams || url.pathname !== "/ktelie/verxcen/cliuekub/siktdlext") {
    return new Response("Not Found", { status: 404 });
  }

  // 2. 浏览器拦截校验：识别并屏蔽 Chrome、Safari、Edge 等普通网页浏览器直接打开
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";
  const accept = req.headers.get("accept")?.toLowerCase() || "";

  // 2.1 常见网络代理客户端的 User-Agent 关键词白名单
  const clientKeywords = [
    "shadowrocket", "clash", "sing-box", "quantumult", "surfboard", 
    "stash", "loon", "v2ray", "trojan", "hiddify", "sagernet", "nekobox", "TianQueApp","subconverter"
  ];
  const isAgent = clientKeywords.some(kw => ua.includes(kw));

  // 2.2 判断是否为网页浏览器访问 (Accept 包含 HTML，或者 UA 包含浏览器特征且不属于白名单内的代理软件)
  const isBrowser = accept.includes("text/html") || 
                    ((ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("applewebkit")) && !isAgent);

  if (isBrowser) {
    // 【模式 A】：直接返回 404 (隐蔽性高，让其以为页面或链接根本不存在)
    return new Response("Not Found", { status: 404 });

    // 【模式 B】：如果您想直接把非代理客户端的请求重定向到百度或您自己前台官网，可以取消下面这行注释：
    // return Response.redirect("https://www.baidu.com", 302);
  }

  // 3. 核心转发：把下面的域名改成你 V2Board 真正的后台面板【公网/本地 IP】或【未被墙的备用域名】
  // 这样 Deno 就能拿着同样的路径和参数，去你的真实后端拉取数据
  const v2boardSubUrl = `https://go.tianquege.top/ktelie/verxcen/cliuekub/siktdlext?${searchParams}`;

  try {
    // 4. 转发请求，重写 User-Agent 隐藏小火箭特征
    const response = await fetch(v2boardSubUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": req.headers.get("accept") || "*/*"
      }
    });

    const subData = await response.text();

    // 5. 将真实的节点数据原样吐给小火箭
    const resHeaders = {
      "content-type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    };

    // 只有源站返回了订阅流量头部（例如 Clash），才向客户端下发，否则留空不设置
    // 这样小火箭在直连和 Deno 中转下，都会统一使用带 🚀 和 💡 图标的副标题文本
    const userInfo = response.headers.get("subscription-userinfo");
    if (userInfo) {
      resHeaders["subscription-userinfo"] = userInfo;
    }

    return new Response(subData, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response("Service Unavailable", { status: 503 });
  }
});
