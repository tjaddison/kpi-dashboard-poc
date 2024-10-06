#!/bin/bash

# Create root-level files
touch .gitignore README.md package.json next.config.js tsconfig.json tailwind.config.js postcss.config.js

# Create public directory
mkdir -p public
touch public/favicon.ico

# Create src directory and its subdirectories
mkdir -p src/{app,components/ui,lib,styles}

# Create files in src/app
touch src/app/layout.tsx src/app/page.tsx

# Create files in src/components/ui
touch src/components/ui/{button,calendar,card,popover,select,tabs,tooltip}.tsx

# Create Dashboard.tsx in src/components
touch src/components/Dashboard.tsx

# Create files in src/lib
touch src/lib/utils.ts

# Create files in src/styles
touch src/styles/globals.css

echo "Next.js dashboard project structure has been created successfully!"