// app/settings/themes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";

type Theme = "default" | "sky" | "emerald" | "dark";

const themes: { id: Theme; name: string; colors: string[] }[] = [
  {
    id: "default",
    name: "Default",
    colors: ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
  },
  {
    id: "sky",
    name: "Sky",
    colors: ["#0EA5E9", "#38BDF8", "#7DD3FC", "#E0F2FE"],
  },
  {
    id: "emerald",
    name: "Emerald",
    colors: ["#10B981", "#34D399", "#6EE7B7", "#D1FAE5"],
  },
  {
    id: "dark",
    name: "Dark",
    colors: ["#1F2937", "#374151", "#4B5563", "#9CA3AF"],
  },
];

export default function ThemeSettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("default");

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("cooperative-theme") as Theme;
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove(
      "theme-default",
      "theme-sky",
      "theme-emerald",
      "theme-dark"
    );

    // Add selected theme class
    root.classList.add(`theme-${theme}`);

    // Save to localStorage
    localStorage.setItem("cooperative-theme", theme);
  };

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    applyTheme(theme);
  };

  const handleApplyTheme = () => {
    // In a real app, you'd save this to the database
    alert(
      `Theme "${
        themes.find((t) => t.id === selectedTheme)?.name
      }" applied successfully!`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Theme Settings</h1>
        <p className="text-gray-600">
          Customize the appearance of your cooperative dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTheme === theme.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{theme.name}</span>
                    {selectedTheme === theme.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                    {theme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Theme Preview */}
                  <div className="mt-4 space-y-2">
                    <div
                      className="h-3 rounded"
                      style={{ backgroundColor: theme.colors[0] }}
                    />
                    <div
                      className="h-2 rounded"
                      style={{ backgroundColor: theme.colors[1] }}
                    />
                    <div
                      className="h-2 rounded"
                      style={{ backgroundColor: theme.colors[2] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor:
                    themes.find((t) => t.id === selectedTheme)?.colors[3] ||
                    "#DBEAFE",
                  borderColor:
                    themes.find((t) => t.id === selectedTheme)?.colors[1] ||
                    "#60A5FA",
                }}
              >
                <div
                  className="text-sm font-medium mb-2"
                  style={{
                    color:
                      themes.find((t) => t.id === selectedTheme)?.colors[0] ||
                      "#3B82F6",
                  }}
                >
                  Dashboard Card
                </div>
                <div className="text-xs text-gray-600">
                  This is how your dashboard cards will look with the selected
                  theme.
                </div>
              </div>

              <Button
                className="w-full"
                style={{
                  backgroundColor:
                    themes.find((t) => t.id === selectedTheme)?.colors[0] ||
                    "#3B82F6",
                }}
                onClick={handleApplyTheme}
              >
                Apply Theme
              </Button>

              <div className="text-xs text-gray-500 text-center">
                Changes will be applied immediately and saved to your
                preferences.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Display Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Compact Mode</div>
                  <div className="text-sm text-gray-500">
                    Reduce padding and spacing
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">High Contrast</div>
                  <div className="text-sm text-gray-500">
                    Increase color contrast
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Large Text</div>
                  <div className="text-sm text-gray-500">
                    Increase font sizes
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Reduced Motion</div>
                  <div className="text-sm text-gray-500">
                    Minimize animations
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
