Deno.serve(async (req) => {
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString(); 

  if (!searchParams || url.pathname !== "/subscribe") {
    return new Response("Not Found", { status: 404 });
  }

  // 【记得改这里】换成你 V2Board 真正的后台面板域名！
  const v2boardSubUrl = `https://go.tianquege.top/ktelie/verxcen/cliuekub/siktdlext?${searchParams}`;

  try {
    const response = await fetch(v2boardSubUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": req.headers.get("accept") || "*/*"
      }
    });

    const subData = await response.text();

    return new Response(subData, {
      status: response.status,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "subscription-userinfo": response.headers.get("subscription-userinfo") || "", 
      },
    });
  } catch (err) {
    return new Response("Service Unavailable", { status: 503 });
  }
});
