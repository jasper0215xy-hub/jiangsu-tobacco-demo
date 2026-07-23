import { test, expect } from "@playwright/test";

test("主演示：登录、门户和经济运行入口可达", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173/login");
  await page.getByRole("button", { name: "进入演示" }).click();
  await expect(page.getByText("全景总控台").first()).toBeVisible();
  await page.getByText("经济运行").first().click();
  await expect(page.getByText("经济运行综合看板")).toBeVisible();
});

test("自定义数据：修改指标后生成对应 AI 分析", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173/economy/agent");
  await expect(page.getByText("本次分析数据（可修改）")).toBeVisible();
  await page.getByRole("spinbutton").nth(6).fill("132.5");
  await page.getByRole("button", { name: "启动预置分析" }).click();
  await expect(page.getByText("库存状态指数预警风险")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("132.5指数")).toBeVisible();
});
