#!/usr/bin/env node

/**
 * Security Verification Script
 *
 * This script helps verify that the security migration was successful by:
 * 1. Checking that NEXT_PUBLIC_API_URL is not defined
 * 2. Verifying .env.local exists with BACKEND_API_URL
 * 3. Confirming server actions are properly configured
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔒 Security Migration Verification\n");

// Check 1: Verify NEXT_PUBLIC_API_URL is not exposed
console.log("✓ Check 1: Verifying backend URL is not exposed to browser...");
const envFiles = [".env", ".env.local", ".env.development"];
let foundPublicUrl = false;

envFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("NEXT_PUBLIC_API_URL")) {
      console.log(`  ❌ SECURITY ISSUE: ${file} contains NEXT_PUBLIC_API_URL`);
      console.log(`     This exposes the backend URL to the browser!`);
      foundPublicUrl = true;
    } else {
      console.log(`  ✓ ${file} looks good (no NEXT_PUBLIC_API_URL)`);
    }
  }
});

if (!foundPublicUrl) {
  console.log("  ✅ PASS: Backend URL is not exposed to browser\n");
} else {
  console.log("  ❌ FAIL: Remove NEXT_PUBLIC_API_URL from environment files\n");
}

// Check 2: Verify BACKEND_API_URL exists in .env.local
console.log("✓ Check 2: Verifying server-side environment variable...");
const envLocalPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf8");
  if (content.includes("BACKEND_API_URL")) {
    console.log(
      "  ✅ PASS: .env.local contains BACKEND_API_URL (server-side only)\n"
    );
  } else {
    console.log("  ❌ FAIL: .env.local missing BACKEND_API_URL\n");
  }
} else {
  console.log("  ❌ FAIL: .env.local file not found\n");
}

// Check 3: Verify server actions exist
console.log("✓ Check 3: Verifying server actions...");
const serverActionsPath = path.join(__dirname, "src/app/actions/dashboard.ts");
if (fs.existsSync(serverActionsPath)) {
  const content = fs.readFileSync(serverActionsPath, "utf8");
  const hasUseServer = content.includes("'use server'");
  const hasGetPortfolio = content.includes(
    "export async function getPortfolioMetrics"
  );
  const hasGenerateInsight = content.includes(
    "export async function generatePortfolioInsight"
  );
  const hasGetAccounts = content.includes("export async function getAccounts");

  if (hasUseServer && hasGetPortfolio && hasGenerateInsight && hasGetAccounts) {
    console.log("  ✅ PASS: Server actions properly configured\n");
  } else {
    console.log("  ❌ FAIL: Server actions missing or incomplete\n");
    if (!hasUseServer) console.log('     - Missing "use server" directive');
    if (!hasGetPortfolio) console.log("     - Missing getPortfolioMetrics");
    if (!hasGenerateInsight)
      console.log("     - Missing generatePortfolioInsight");
    if (!hasGetAccounts) console.log("     - Missing getAccounts");
  }
} else {
  console.log("  ❌ FAIL: Server actions file not found\n");
}

// Check 4: Verify stores are using server actions
console.log("✓ Check 4: Verifying stores use server actions...");
const portfolioStorePath = path.join(__dirname, "src/store/portfolio.store.ts");
const accountsStorePath = path.join(__dirname, "src/store/accounts.store.ts");

let storesUpdated = true;

if (fs.existsSync(portfolioStorePath)) {
  const content = fs.readFileSync(portfolioStorePath, "utf8");
  if (content.includes('from "@/app/actions/dashboard"')) {
    console.log("  ✓ portfolio.store.ts uses server actions");
  } else if (content.includes('from "@/lib/api"')) {
    console.log("  ❌ portfolio.store.ts still uses direct API calls");
    storesUpdated = false;
  }
}

if (fs.existsSync(accountsStorePath)) {
  const content = fs.readFileSync(accountsStorePath, "utf8");
  if (content.includes('from "@/app/actions/dashboard"')) {
    console.log("  ✓ accounts.store.ts uses server actions");
  } else if (content.includes('from "@/lib/api"')) {
    console.log("  ❌ accounts.store.ts still uses direct API calls");
    storesUpdated = false;
  }
}

if (storesUpdated) {
  console.log("  ✅ PASS: Stores migrated to server actions\n");
} else {
  console.log("  ❌ FAIL: Some stores still use direct API calls\n");
}

// Summary
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Summary:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log("To test the security in browser:");
console.log("1. Open http://localhost:3001/dashboard");
console.log("2. Open DevTools → Network tab");
console.log("3. Refresh the page");
console.log("4. Check that requests go to localhost:3001 (Next.js)");
console.log("5. Verify NO requests go to localhost:8000 (FastAPI)");
console.log("");
console.log("✅ If all checks pass, your backend is secure!");
console.log("");
