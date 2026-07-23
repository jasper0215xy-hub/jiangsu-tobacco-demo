const response = await fetch("http://localhost:3001/api/demo/reset", { method: "POST" });
console.log(response.ok ? "演示场景已重置" : "重置失败：请确认 API 服务已启动");
