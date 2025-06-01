# AgriAI Theme System

## Overview

The AgriAI frontend implements a sophisticated multi-theme architecture that allows for complete separation of styling between different UI themes. This system prevents style conflicts and allows each theme to have its own distinct look and feel while sharing the same underlying components and functionality.

## Theme Types

1. **Classic Theme**: The original AgriAI light theme focused on green colors and a clean, minimalist UI, suitable for professional agricultural use.
2. **Futuristic Theme**: A dark, modern theme with a high-tech aesthetic, neon accents, and glass effects, designed for a more immersive experience.

## How Themes Work

Each theme has:
- Its own Tailwind configuration file with theme-specific styling
- Separate CSS output file to avoid style conflicts
- Theme-specific CSS class prefixing to prevent CSS interference
- Dedicated components and styles that respect the theme's design language

### Technical Implementation

The theme system works through several key mechanisms:

1. **CSS Isolation**: Each theme's styles are scoped to a specific theme class (e.g., `.theme-classic`, `.theme-futuristic`)
2. **Tailwind Prefixing**: Theme-specific Tailwind configurations use prefixes to avoid style collisions
3. **Dynamic Theme Switching**: A React Context API manages theme state and toggles the active theme
4. **CSS Build Process**: Separate build processes generate CSS for each theme independently

### File Structure

```
frontend/
├── tailwind.config.js           # Base Tailwind config
├── tailwind.classic.config.js   # Classic theme config
├── tailwind.futuristic.config.js # Futuristic theme config
├── input.css                    # Base CSS file
├── watch-themes.js              # Script to watch for theme changes
├── build-themes.js              # Script to build all themes
├── dev-with-themes.js           # Development script with theme support
├── start_frontend_with_themes.ps1 # PowerShell script for Windows development
└── src/
    ├── themes/
    │   ├── classic/
    │   │   ├── input.css        # Classic theme CSS imports
    │   │   ├── output.css       # Generated CSS for classic theme
    │   │   ├── ClassicApp.jsx   # Classic theme root component
    │   │   ├── components/
    │   │   │   └── ClassicThemeDemo.jsx # Classic theme demo component
    │   │   └── ...              # Other classic theme components
    │   └── futuristic/
    │       ├── input.css        # Futuristic theme CSS imports
    │       ├── output.css       # Generated CSS for futuristic theme
    │       ├── FuturisticApp.jsx # Futuristic theme root component
    │       ├── components/
    │       │   └── ThemeDemo.jsx # Futuristic theme demo component
    │       └── ...              # Other futuristic theme components
    ├── context/
    │   └── UIThemeContext.jsx   # Theme context provider
    └── ThemeApp.jsx             # Root theme selector component
```

## Building Theme CSS

To build the CSS for all themes:

```bash
npm run build:css:all
```

To build individual themes:

```bash
# Classic theme only
npm run build:css:classic

# Futuristic theme only
npm run build:css:futuristic
```

## Development Workflow

### Starting the Development Environment

For Windows users, the easiest way to start development with theme support:

```powershell
.\start_frontend_with_themes.ps1
```

This PowerShell script will:
1. Build all theme CSS files
2. Start a theme watcher in a separate window to automatically rebuild CSS on changes
3. Start the Vite development server

### Other Development Commands

```bash
# Run the Node.js development script
npm run dev:full

# Start the theme watcher separately (watches for CSS/component changes)
npm run watch:themes

# Build themes once and start the dev server
npm run dev:with-themes
```

## How CSS Separation Works

1. Each theme's Tailwind CSS uses a `.theme-{themeName}` prefix added to the HTML root element
2. The `ThemeApp.jsx` component adds the appropriate class to the root element based on the selected theme
3. Tailwind prefixes all generated classes with the theme prefix
4. This ensures that CSS from one theme doesn't affect the other theme's components

## Testing Theme Separation

To verify that themes are properly separated:

1. Visit the theme demo pages in each theme:
   - Classic theme: `/theme-demo`
   - Futuristic theme: `/theme-demo`
2. Use the theme switcher button (bottom right corner) to toggle between themes
3. Verify that styles don't interfere with each other when switching themes
4. Check that theme-specific components maintain their styling integrity

## Adding a New Theme

To add a new theme to the system:

1. Create a new folder in `src/themes/` (e.g., `src/themes/cyberpunk/`)
2. Create a new Tailwind config file with the appropriate prefix (e.g., `tailwind.cyberpunk.config.js`)
3. Add build scripts to package.json for the new theme
4. Create theme-specific components and styles
5. Update `ThemeApp.jsx` to include the new theme option
6. Add the new theme to `UIThemeContext.jsx`

## Troubleshooting

If you encounter styling issues:

1. **Theme Class Missing**: Check if the theme class is properly applied to the root element
2. **CSS Not Generated**: Verify that the theme-specific Tailwind CSS is being generated and loaded
3. **Component Styling Issues**: Check that components are using theme-specific classes
4. **Build Process Errors**: Try rebuilding the theme CSS files using `npm run build:css:all`
5. **Prefix Conflicts**: Ensure that theme prefixes are correctly set in the Tailwind config files

## Best Practices

1. **Use Theme-Specific Colors**: Always use theme-specific color variables instead of hardcoded values
2. **Test Both Themes**: Test components in both themes to ensure proper styling separation
3. **Check Theme Demo**: Use the theme demo components to test new theme-specific styles
4. **Rebuild After Config Changes**: Always rebuild theme CSS after modifying Tailwind config files
5. **Use Theme Context**: Access the current theme through the UIThemeContext
