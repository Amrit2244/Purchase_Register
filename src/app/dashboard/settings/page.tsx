// app/settings/page.tsx (or wherever your route is located)

// This is a Server Component — no 'use client'
import SettingsContent from './SettingsContent';

export default async function SettingsPage() {
  // Simulated package.json content (in real app, read from disk or env)
  const packageJsonContent = `{
    "name": "purchase_register",
    "version": "0.1.0",
    "private": true
  }`;

  const packageJson = JSON.parse(packageJsonContent);
  const appVersion = packageJson.version || "N/A";

  return <SettingsContent appVersion={appVersion} />;
}
