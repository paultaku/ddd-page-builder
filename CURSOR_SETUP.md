# Cursor Editor Setup for English Comments

This document explains how to configure Cursor editor to always use English for comments and code generation.

## Configuration Files Created

### 1. Global Settings (`~/Library/Application Support/Cursor/User/settings.json`)

The following settings have been added to your global Cursor configuration:

```json
{
  "cursor.chat.defaultLanguage": "en",
  "cursor.chat.language": "en",
  "cursor.chat.systemPrompt": "You are a helpful AI coding assistant. Always respond in English and write comments in English. Use clear, concise language for all code explanations and comments.",
  "cursor.chat.contextLanguage": "en",
  "cursor.chat.preferredLanguage": "en"
}
```

### 2. Project Settings (`.vscode/settings.json`)

Project-specific settings that override global settings:

```json
{
  "cursor.chat.defaultLanguage": "en",
  "cursor.chat.language": "en",
  "cursor.chat.systemPrompt": "You are a helpful AI coding assistant. Always respond in English and write comments in English. Use clear, concise language for all code explanations and comments. When generating code, always include English comments to explain the functionality.",
  "cursor.chat.contextLanguage": "en",
  "cursor.chat.preferredLanguage": "en",
  "cursor.chat.commentLanguage": "en",
  "cursor.chat.codeCommentLanguage": "en"
}
```

### 3. Cursor Rules (`.cursorrules`)

A `.cursorrules` file has been created with specific instructions for the AI assistant:

```markdown
# Cursor Rules for DDD Page Builder Project

## Language Settings

- Always respond in English
- Always write comments in English
- Use clear, concise language for all code explanations
- Generate code with English comments to explain functionality

## Code Style Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Use TailwindCSS for styling
- Write descriptive variable and function names
- Include JSDoc comments for complex functions

## Comment Standards

- Write comments in English only
- Use clear and descriptive language
- Explain the "why" not just the "what"
- Keep comments up to date with code changes
- Use consistent comment formatting
```

## How to Apply These Settings

### Method 1: Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. Open your project
4. The settings will be automatically applied

### Method 2: Reload Window

1. In Cursor, press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Developer: Reload Window"
3. Press Enter

### Method 3: Check Settings

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Preferences: Open Settings (JSON)"
3. Verify that the cursor settings are present

## Testing the Configuration

To test if the configuration is working:

1. Open any TypeScript/JavaScript file in your project
2. Use Cursor's AI features (Cmd+K or Ctrl+K)
3. Ask it to add comments to your code
4. Verify that all generated comments are in English

## Additional Tips

### For New Projects

When starting a new project, copy these files:

- `.vscode/settings.json`
- `.cursorrules`

### For Existing Projects

Add the `.cursorrules` file to any existing project to ensure English comments.

### Customizing the System Prompt

You can modify the `cursor.chat.systemPrompt` in your settings to add specific requirements:

```json
{
  "cursor.chat.systemPrompt": "You are a helpful AI coding assistant. Always respond in English and write comments in English. Use clear, concise language for all code explanations and comments. Follow these specific guidelines: [your custom guidelines here]"
}
```

## Troubleshooting

### If Comments Are Still in Chinese

1. Check that the `.cursorrules` file is in your project root
2. Verify the settings in `.vscode/settings.json`
3. Try reloading the window
4. Restart Cursor completely

### If Settings Don't Apply

1. Check file permissions on the settings files
2. Ensure the JSON syntax is valid
3. Try creating a new workspace and copying the settings

## Files Modified

The following files have been updated to use English comments:

- `src/app/editor/page.tsx` - Main editor component
- `src/types/editor.ts` - Type definitions
- `README.md` - Project documentation

All comments and user-facing text have been converted to English for consistency.
