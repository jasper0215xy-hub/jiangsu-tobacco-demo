const response = await fetch("http://localhost:3001/api/demo/health");
console.log(response.ok ? JSON.stringify(await response.json(), null, 2) : "健康检查失败：请确认 API 服务已启动");
