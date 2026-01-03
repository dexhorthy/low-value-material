# Rich Text Notes Specification

Notes provide extended information for tasks and projects beyond the title. Notes support rich text formatting, embedded links, and inline attachments.

## Data Model

### Note Access

Tasks and projects provide two complementary access points for notes:

| Property | Type | Description |
|----------|------|-------------|
| `note` | String \| null | Plain text representation of note content |
| `note_text` | TextObject \| null | Rich text object with styling and embedded content |

These properties represent the same underlying content in different forms:
- `note` returns plain text with all formatting stripped
- `note_text` returns full rich text with styles, links, and attachments

### Text Object

A Text Object is a container holding text content along with formatting metadata.

| Field | Type | Description |
|-------|------|-------------|
| `string` | String | Plain text content |
| `style` | Style | Default style applied to entire text |
| `attribute_runs` | AttributeRun[] | Contiguous blocks with identical styling |
| `attachments` | TextAttachment[] | Inline attachment references |
| `range` | Range | Bounds of entire text (start=0, end=length) |

### Attribute Run

Represents a contiguous range of text with consistent styling.

| Field | Type | Description |
|-------|------|-------------|
| `range` | Range | Start and end positions in text |
| `style` | Style | Style applied to this range |

### Range

| Field | Type | Description |
|-------|------|-------------|
| `start` | Integer | Starting character index (0-based) |
| `end` | Integer | Ending character index (exclusive) |

## Style Object

Styles define formatting attributes applied to text ranges.

### Font Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `font_family` | String \| null | Font family name (e.g., "Helvetica") |
| `font_size` | Number \| null | Font size in points |
| `font_weight` | Enum \| null | `regular`, `bold`, `light`, `medium`, etc. |
| `font_italic` | Boolean | Italic style |
| `font_condensed` | Boolean | Condensed font variant |
| `font_fill_color` | Color \| null | Text color |

**Recommendation**: Use `font_family` + `font_weight` + `font_italic` rather than specific font names for consistent cross-platform rendering.

### Text Decoration

| Attribute | Type | Description |
|-----------|------|-------------|
| `underline_style` | Enum \| null | `none`, `single`, `double`, `thick` |
| `underline_color` | Color \| null | Color of underline |
| `strikethrough_style` | Enum \| null | `none`, `single`, `double`, `thick` |
| `strikethrough_color` | Color \| null | Color of strikethrough |

Decoration patterns: `solid`, `dot`, `dash`, `dash_dot`, `dash_dot_dot`

### Paragraph Formatting

| Attribute | Type | Description |
|-----------|------|-------------|
| `alignment` | Enum | `left`, `right`, `center`, `justified`, `natural` |
| `line_height_multiple` | Number \| null | Line height as multiple of default |
| `first_line_indent` | Number \| null | Indent of first line in points |
| `head_indent` | Number \| null | Left margin indent in points |
| `tail_indent` | Number \| null | Right margin indent in points |
| `writing_direction` | Enum | `left_to_right`, `right_to_left`, `natural` |

### Advanced Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `link` | URL \| null | Hyperlink URL |
| `baseline_offset` | Number \| null | Vertical text offset in points |
| `superscript` | Integer \| null | Superscript level (negative = subscript) |
| `kerning` | Number \| null | Character spacing adjustment |
| `obliqueness` | Number \| null | Text skew/slant |
| `expansion` | Number \| null | Horizontal text stretch |
| `ligature` | Enum | `all`, `essential`, `standard` |

### Color

Colors are represented in a format that adapts between light and dark modes:

| Field | Type | Description |
|-------|------|-------------|
| `red` | Float | Red component (0.0-1.0) |
| `green` | Float | Green component (0.0-1.0) |
| `blue` | Float | Blue component (0.0-1.0) |
| `alpha` | Float | Opacity (0.0-1.0), default 1.0 |

Colors are modeled for light mode rendering and dynamically adapt for dark mode display.

## Supported Formatting

### Via Format Menu (UI)

| Format | Keyboard Shortcut | Description |
|--------|------------------|-------------|
| Bold | ⌘B | Heavier font weight |
| Italic | ⌘I | Slanted text |
| Underline | ⌘U | Line beneath text |
| Strikethrough | — | Line through text |
| Bigger | ⌘+ | Increase font size |
| Smaller | ⌘- | Decrease font size |

### Additional Format Menu Options

- **Show/Hide Fonts**: Opens font panel for family, size, weight selection
- **Show/Hide Colors**: Opens color picker for text color
- **Kern**: Adjusts character spacing
- **Ligatures**: Enables/disables connected letter combinations
- **Baseline**: Modifies vertical text positioning
- **Alignment**: Left, Center, Right, Justified

### Style Management

| Operation | Shortcut | Description |
|-----------|----------|-------------|
| Copy Style | ⌥⌘C | Copy formatting from selected text |
| Paste Style | ⌥⌘V | Apply copied formatting to selection |
| Clear Style | ⌃⌘⌫ | Remove ALL formatting (preserves attachments/links) |
| Simplify Style | — | Remove custom fonts, colors, sizes; keep bold/italic/underline |

**Clear Style** removes: bold, italic, underline, bulleted lists, custom fonts, text colors, background colors, sizes. Result is plain text. Attachments and links preserved.

**Simplify Style** removes: custom fonts, text colors, background colors, custom sizes, alignment. Keeps: bold, italic, underline, bulleted lists. Attachments and links preserved.

## Links

Text can contain embedded hyperlinks.

### Link Properties

| Field | Type | Description |
|-------|------|-------------|
| `url` | URL | Target URL |
| `text` | String | Display text for link |
| `range` | Range | Position in note text |

### Link Behavior

- Links are styled by the system (typically blue/underlined)
- Custom color attributes cannot override link styling
- Click/tap opens URL in default browser
- Long-press shows URL preview with options

### Link Operations

```
add_link(note_text: TextObject, range: Range, url: URL) → TextObject
remove_link(note_text: TextObject, range: Range) → TextObject
get_links(note_text: TextObject) → Link[]
```

## Inline Attachments

Notes can contain inline attachments that appear within the text flow.

### Text Attachment

| Field | Type | Description |
|-------|------|-------------|
| `attachment_id` | UUID | Reference to Attachment object |
| `range` | Range | Position in text (occupies 1 character) |
| `style` | Style | Style context for attachment |

Inline attachments appear as special characters in the text that render as the attachment preview. See `specs/attachments.md` for full attachment data model.

### Creating Inline Attachments

```
insert_inline_attachment(
  note_text: TextObject,
  position: Integer,
  file: FileData,
  style?: Style
) → TextObject
```

## Operations

### Set Note (Plain Text)

```
set_note(
  item_id: UUID,
  item_type: "task" | "project",
  text: String
) → void
```

- Replaces entire note content
- Removes all formatting
- Preserves nothing from previous content

### Set Note Text (Rich Text)

```
set_note_text(
  item_id: UUID,
  item_type: "task" | "project",
  text_object: TextObject
) → void
```

- Replaces entire note with rich text object
- Preserves all formatting and attachments

### Text Manipulation

```
insert_text(text_object: TextObject, position: Integer, text: String) → TextObject
append_text(text_object: TextObject, text: String) → TextObject
replace_text(text_object: TextObject, range: Range, text: String) → TextObject
remove_text(text_object: TextObject, range: Range) → TextObject
```

### Style Operations

```
apply_style(text_object: TextObject, range: Range, style: Style) → TextObject
get_style_for_range(text_object: TextObject, range: Range) → Style
clear_style(text_object: TextObject, range: Range) → TextObject
simplify_style(text_object: TextObject, range: Range) → TextObject
```

### Search Operations

```
find_in_note(
  text_object: TextObject,
  query: String,
  options?: FindOptions
) → Range[]
```

**Find Options**:
- `case_insensitive`: Boolean (default true)
- `regular_expression`: Boolean (default false)
- `backwards`: Boolean (default false)
- `anchored`: Boolean (default false) — match at start only

### Text Segments

```
get_paragraphs(text_object: TextObject) → TextObject[]
get_sentences(text_object: TextObject) → TextObject[]
get_words(text_object: TextObject) → TextObject[]
get_characters(text_object: TextObject) → String[]
```

## Markdown Support

**Note**: Native Markdown rendering is NOT supported. Notes use Rich Text Format (RTF).

### Workarounds

1. **Copy/Paste**: RTF from other apps preserves formatting when pasted
2. **External Linking**: Store detailed notes in Markdown editors (Bear, Obsidian) and link from OmniFocus
3. **Automation**: Convert Markdown to RTF programmatically before setting note content

### Why Not Markdown?

- RTF provides WYSIWYG editing experience
- Supports inline attachments naturally
- Compatible with macOS/iOS text system
- Works with system spell check, grammar, etc.

## Search Integration

Notes are fully searchable:

1. **Plain Text Search**: Searches `note` (plain text representation)
2. **Attachment Search**: Attachment filenames within notes are searchable
3. **Link Search**: Link URLs and display text are searchable

Note content has lower search weight than task/project titles.

## Platform Considerations

### macOS

- Full Format menu access
- Font panel with complete font library
- Color picker with system colors
- Keyboard shortcuts for all formatting
- Drag-drop attachments into note

### iOS/iPadOS

- Format toolbar in note editor
- Subset of font options
- System color picker
- Attachment via share sheet or media picker

### Web

- Basic formatting toolbar
- Limited font selection (web-safe fonts)
- Color picker with preset colors
- File upload for attachments

### Apple Vision Pro

- Full Format menu via menu bar
- Spatial keyboard input
- Voice dictation support

## Sync Behavior

- Rich text formatting syncs across devices
- Platform-specific fonts fall back to system equivalents
- Color values preserved exactly
- Inline attachments sync per `specs/attachments.md`

## Automation

### URL Scheme

```
omnifocus:///add?name=Task&note=Plain+text+note
```

Note: URL scheme only supports plain text notes.

### Shortcuts Actions

- **Add OmniFocus Item**: Accepts plain text note
- **Get Item Details**: Returns `note` as plain text

### Omni Automation (JavaScript)

```javascript
// Access plain text
const plainNote = task.note;

// Access rich text
const richNote = task.noteText;

// Modify plain text
task.note = "New note content";

// Create styled text
const text = new Text("Important note", task.noteText.style);
text.style.set(Style.Attribute.FontWeight, 9); // Bold
task.noteText = text;

// Add link
const linkStyle = text.styleForRange(text.range);
linkStyle.set(Style.Attribute.Link, URL.fromString("https://example.com"));
```

## Best Practices

1. **Keep Notes Focused**: Use for relevant context, not lengthy documentation
2. **Use Links**: Reference external documents rather than embedding large content
3. **Consistent Formatting**: Stick to basic styles (bold, italic, lists) for portability
4. **Avoid Custom Fonts**: System fonts ensure consistent display across platforms
5. **Simplify Before Sharing**: Use "Simplify Style" before exporting/sharing tasks

## Edge Cases

### Empty Notes

- `note` returns empty string ""
- `note_text` returns empty TextObject with default style
- Empty notes are treated as null for display purposes

### Very Long Notes

- No hard character limit
- Performance may degrade with extremely long notes (>100KB)
- Consider external linking for large reference documents

### Conflicting Styles

- When ranges overlap, later-applied styles win
- Attribute runs automatically merge or split as needed

### Invalid Ranges

- Operations on out-of-bounds ranges throw errors
- Range end must be >= start
- Range must not exceed text length

### Font Substitution

- Missing fonts fall back to system default
- Bold/italic preserved via weight/style attributes
- Custom fonts may render differently across platforms
