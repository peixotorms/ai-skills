import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname, relative, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR =
  process.env.CLAUDE_PLUGIN_ROOT
    ? join(process.env.CLAUDE_PLUGIN_ROOT, "components")
    : join(__dirname, "..", "components");

const FRAMEWORKS = {
  hyperui: {
    name: "HyperUI (HTML)",
    ext: ".html",
    deps: "None — pure Tailwind CSS classes (some need @tailwindcss/forms)",
  },
  "headlessui-react": {
    name: "HeadlessUI React (TSX)",
    ext: ".tsx",
    deps: "npm install @headlessui/react",
  },
  "headlessui-vue": {
    name: "HeadlessUI Vue (SFC)",
    ext: ".vue",
    deps: "npm install @headlessui/vue",
  },
  daisyui: {
    name: "DaisyUI (CSS Framework)",
    ext: ".md",
    deps: "npm install daisyui",
  },
  flyonui: {
    name: "FlyonUI (CSS Framework)",
    ext: ".css",
    deps: "npm install flyonui",
  },
};

function buildIndex() {
  const index = {};

  for (const [framework, meta] of Object.entries(FRAMEWORKS)) {
    const fwDir = join(COMPONENTS_DIR, framework);
    if (!existsSync(fwDir)) continue;

    index[framework] = { ...meta, categories: {} };

    if (framework === "hyperui") {
      walkHyperUI(fwDir, index[framework].categories);
    } else if (framework === "headlessui-react" || framework === "headlessui-vue") {
      walkHeadlessUI(fwDir, meta.ext, index[framework].categories);
    } else if (framework === "daisyui") {
      walkFlat(fwDir, meta.ext, index[framework].categories);
    } else if (framework === "flyonui") {
      walkFlyonUI(fwDir, index[framework].categories);
    }
  }

  return index;
}

// HyperUI: category/type/variant.html (2-level)
function walkHyperUI(dir, categories) {
  for (const category of safeReaddir(dir)) {
    const catDir = join(dir, category);
    if (!isDir(catDir)) continue;
    categories[category] = { types: {} };

    for (const compType of safeReaddir(catDir)) {
      const typeDir = join(catDir, compType);
      if (!isDir(typeDir)) continue;

      const variants = safeReaddir(typeDir)
        .filter((f) => f.endsWith(".html"))
        .map((f) => basename(f, ".html"));

      if (variants.length > 0) {
        categories[category].types[compType] = variants;
      }
    }
  }
}

// HeadlessUI: component/example.ext (1-level)
function walkHeadlessUI(dir, ext, categories) {
  categories["components"] = { types: {} };
  for (const comp of safeReaddir(dir)) {
    const compDir = join(dir, comp);
    if (!isDir(compDir)) continue;

    const variants = safeReaddir(compDir)
      .filter((f) => f.endsWith(ext))
      .map((f) => basename(f, ext));

    if (variants.length > 0) {
      categories["components"].types[comp] = variants;
    }
  }
}

// Flat: component.ext (single directory)
function walkFlat(dir, ext, categories) {
  categories["components"] = { types: {} };
  const files = safeReaddir(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => basename(f, ext));

  if (files.length > 0) {
    categories["components"].types["all"] = files;
  }
}

// FlyonUI: css/component.css + plugins/plugin/index.ts (2-section)
function walkFlyonUI(dir, categories) {
  // CSS components
  const cssDir = join(dir, "css");
  if (existsSync(cssDir)) {
    categories["css"] = { types: {} };
    const files = safeReaddir(cssDir)
      .filter((f) => f.endsWith(".css"))
      .map((f) => basename(f, ".css"));
    if (files.length > 0) {
      categories["css"].types["all"] = files;
    }
  }

  // JS plugins
  const pluginsDir = join(dir, "plugins");
  if (existsSync(pluginsDir)) {
    categories["plugins"] = { types: {} };
    for (const plugin of safeReaddir(pluginsDir)) {
      const pluginDir = join(pluginsDir, plugin);
      if (!isDir(pluginDir)) continue;

      const files = safeReaddir(pluginDir)
        .filter((f) => f.endsWith(".ts") || f.endsWith(".css"))
        .map((f) => basename(f, extname(f)));

      if (files.length > 0) {
        categories["plugins"].types[plugin] = files;
      }
    }
  }
}

function safeReaddir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function resolveComponent(framework, category, componentType, variant) {
  const meta = FRAMEWORKS[framework];
  if (!meta) return null;

  let filePath;

  if (framework === "hyperui") {
    filePath = join(COMPONENTS_DIR, framework, category, componentType, `${variant}.html`);
  } else if (framework === "headlessui-react") {
    filePath = join(COMPONENTS_DIR, framework, componentType, `${variant}.tsx`);
  } else if (framework === "headlessui-vue") {
    filePath = join(COMPONENTS_DIR, framework, componentType, `${variant}.vue`);
  } else if (framework === "daisyui") {
    filePath = join(COMPONENTS_DIR, framework, `${variant}.md`);
  } else if (framework === "flyonui") {
    if (category === "css") {
      filePath = join(COMPONENTS_DIR, framework, "css", `${variant}.css`);
    } else if (category === "plugins") {
      const ext = variant === "variants" ? ".css" : ".ts";
      filePath = join(COMPONENTS_DIR, framework, "plugins", componentType, `${variant}${ext}`);
    }
  }

  return filePath && existsSync(filePath) ? filePath : null;
}

function searchComponents(query, framework) {
  const results = [];
  const terms = query.toLowerCase().split(/\s+/);

  const searchDir = framework
    ? join(COMPONENTS_DIR, framework)
    : COMPONENTS_DIR;

  if (!existsSync(searchDir)) return results;

  walkFiles(searchDir, (filePath) => {
    const rel = relative(COMPONENTS_DIR, filePath).toLowerCase();
    if (terms.every((t) => rel.includes(t))) {
      results.push(relative(COMPONENTS_DIR, filePath));
    }
  });

  return results.slice(0, 30);
}

function walkFiles(dir, callback) {
  for (const entry of safeReaddir(dir)) {
    const full = join(dir, entry);
    if (isDir(full)) {
      walkFiles(full, callback);
    } else {
      callback(full);
    }
  }
}

// Prevent path traversal
function isSafePath(relPath) {
  const normalized = join(COMPONENTS_DIR, relPath);
  return normalized.startsWith(COMPONENTS_DIR) && !relPath.includes("..");
}

const INDEX = buildIndex();

const server = new McpServer({
  name: "frontend-components",
  version: "1.0.0",
});

// Tool: list_frameworks
server.registerTool(
  "list_frameworks",
  {
    title: "List Frameworks",
    description:
      "List all available frontend component frameworks and their dependencies",
    inputSchema: {},
  },
  async () => {
    const lines = [];
    for (const [id, fw] of Object.entries(INDEX)) {
      const totalVariants = Object.values(fw.categories).reduce(
        (sum, cat) =>
          sum +
          Object.values(cat.types).reduce((s, v) => s + v.length, 0),
        0
      );
      lines.push(`## ${fw.name} (\`${id}\`)`);
      lines.push(`- Dependencies: ${fw.deps}`);
      lines.push(`- Components: ${totalVariants} variants`);
      lines.push(
        `- Categories: ${Object.keys(fw.categories).join(", ")}`
      );
      lines.push("");
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// Tool: list_components
server.registerTool(
  "list_components",
  {
    title: "List Components",
    description:
      "List all component types and variants in a framework. Optionally filter by category.",
    inputSchema: {
      framework: z
        .enum(Object.keys(FRAMEWORKS))
        .describe("Framework ID (e.g. hyperui, daisyui, flyonui, headlessui-react, headlessui-vue)"),
      category: z
        .string()
        .optional()
        .describe(
          "Category to filter (e.g. application, marketing, css, plugins, components)"
        ),
    },
  },
  async ({ framework, category }) => {
    const fw = INDEX[framework];
    if (!fw)
      return {
        content: [{ type: "text", text: `Unknown framework: ${framework}` }],
      };

    const lines = [`# ${fw.name} Components\n`];
    const cats = category
      ? { [category]: fw.categories[category] }
      : fw.categories;

    for (const [catName, catData] of Object.entries(cats)) {
      if (!catData) continue;
      lines.push(`## ${catName}`);
      for (const [typeName, variants] of Object.entries(catData.types)) {
        lines.push(`- **${typeName}** (${variants.length}): ${variants.join(", ")}`);
      }
      lines.push("");
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// Tool: get_component
server.registerTool(
  "get_component",
  {
    title: "Get Component",
    description:
      "Get the full source code of a specific component variant. Use list_components to find available variants first.",
    inputSchema: {
      framework: z
        .enum(Object.keys(FRAMEWORKS))
        .describe("Framework ID"),
      category: z
        .string()
        .describe(
          "Category (e.g. application, marketing, css, plugins, components)"
        ),
      component_type: z
        .string()
        .describe("Component type (e.g. badges, dialog, accordion, all)"),
      variant: z.string().describe("Variant name (e.g. 1, 1-dark, simple)"),
    },
  },
  async ({ framework, category, component_type, variant }) => {
    const filePath = resolveComponent(
      framework,
      category,
      component_type,
      variant
    );

    if (!filePath) {
      const results = searchComponents(
        `${component_type} ${variant}`,
        framework
      );
      if (results.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Component not found at exact path. Did you mean:\n${results.map((r) => `- ${r}`).join("\n")}`,
            },
          ],
        };
      }
      return {
        content: [{ type: "text", text: "Component not found." }],
      };
    }

    const code = readFileSync(filePath, "utf-8");
    const ext = extname(filePath).slice(1);
    const meta = FRAMEWORKS[framework];

    return {
      content: [
        {
          type: "text",
          text: `# ${variant}\n\n**Framework:** ${meta.name}\n**Dependencies:** ${meta.deps}\n\n\`\`\`${ext}\n${code}\n\`\`\``,
        },
      ],
    };
  }
);

// Tool: search_components
server.registerTool(
  "search_components",
  {
    title: "Search Components",
    description:
      "Search for components by keyword across all frameworks or within a specific framework. Searches file names and paths.",
    inputSchema: {
      query: z
        .string()
        .describe("Search keywords (e.g. 'badge dark', 'modal', 'accordion')"),
      framework: z
        .enum([...Object.keys(FRAMEWORKS), "all"])
        .optional()
        .default("all")
        .describe("Framework to search in, or 'all'"),
    },
  },
  async ({ query, framework }) => {
    const fw = framework === "all" ? undefined : framework;
    const results = searchComponents(query, fw);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No components found for "${query}". Try broader keywords.`,
          },
        ],
      };
    }

    const lines = [`# Search: "${query}"\n`, `Found ${results.length} results:\n`];
    for (const r of results) {
      lines.push(`- \`${r}\``);
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// Tool: get_component_by_path
server.registerTool(
  "get_component_by_path",
  {
    title: "Get Component by Path",
    description:
      "Get component source code by its relative path (as returned by search_components).",
    inputSchema: {
      path: z
        .string()
        .describe(
          "Relative path from search results (e.g. hyperui/application/badges/1.html)"
        ),
    },
  },
  async ({ path: relPath }) => {
    if (!isSafePath(relPath)) {
      return {
        content: [{ type: "text", text: "Invalid path." }],
      };
    }

    const filePath = join(COMPONENTS_DIR, relPath);
    if (!existsSync(filePath)) {
      return {
        content: [{ type: "text", text: `File not found: ${relPath}` }],
      };
    }

    const code = readFileSync(filePath, "utf-8");
    const ext = extname(filePath).slice(1);

    return {
      content: [
        {
          type: "text",
          text: `# ${basename(relPath)}\n\n\`\`\`${ext}\n${code}\n\`\`\``,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
