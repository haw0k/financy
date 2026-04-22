# Refactoring Tasks

Project optimization and refactoring task list.

## Unused shadcn Components

The following components exist in `lib/shadcn/` but are not used in the project. They can be removed along with their dependencies in `package.json`.

### Radix UI packages (unused)

| Component | File | Package |
|-----------|------|---------|
| Accordion | `lib/shadcn/Accordion.tsx` | `@radix-ui/react-accordion` |
| Alert | `lib/shadcn/Alert.tsx` | `@radix-ui/react-alert-dialog` |
| AlertDialog | `lib/shadcn/AlertDialog.tsx` | `@radix-ui/react-alert-dialog` |
| AspectRatio | `lib/shadcn/AspectRatio.tsx` | `@radix-ui/react-aspect-ratio` |
| Avatar | `lib/shadcn/Avatar.tsx` | `@radix-ui/react-avatar` |
| Badge | `lib/shadcn/Badge.tsx` | (CSS) |
| Breadcrumb | `lib/shadcn/Breadcrumb.tsx` | (CSS) |
| ButtonGroup | `lib/shadcn/ButtonGroup.tsx` | (CSS) |
| Calendar | `lib/shadcn/Calendar.tsx` | `react-day-picker` |
| Carousel | `lib/shadcn/Carousel.tsx` | `embla-carousel-react` |
| Chart | `lib/shadcn/Chart.tsx` | `recharts` |
| Checkbox | `lib/shadcn/Checkbox.tsx` | `@radix-ui/react-checkbox` |
| Collapsible | `lib/shadcn/Collapsible.tsx` | `@radix-ui/react-collapsible` |
| Command | `lib/shadcn/Command.tsx` | `cmdk` |
| ContextMenu | `lib/shadcn/ContextMenu.tsx` | `@radix-ui/react-context-menu` |
| Dialog | `lib/shadcn/Dialog.tsx` | `@radix-ui/react-dialog` |
| Drawer | `lib/shadcn/Drawer.tsx` | `vaul` |
| DropdownMenu | `lib/shadcn/DropdownMenu.tsx` | `@radix-ui/react-dropdown-menu` |
| Empty | `lib/shadcn/Empty.tsx` | (CSS) |
| Field | `lib/shadcn/Field.tsx` | `@hookform/resolvers` |
| Form | `lib/shadcn/Form.tsx` | `react-hook-form` |
| HoverCard | `lib/shadcn/HoverCard.tsx` | `@radix-ui/react-hover-card` |
| InputGroup | `lib/shadcn/InputGroup.tsx` | (CSS) |
| InputOtp | `lib/shadcn/InputOtp.tsx` | `input-otp` |
| Item | `lib/shadcn/Item.tsx` | (CSS) |
| Kbd | `lib/shadcn/Kbd.tsx` | (CSS) |
| Menubar | `lib/shadcn/Menubar.tsx` | `@radix-ui/react-menubar` |
| NavigationMenu | `lib/shadcn/NavigationMenu.tsx` | `@radix-ui/react-navigation-menu` |
| Pagination | `lib/shadcn/Pagination.tsx` | (CSS) |
| Popover | `lib/shadcn/Popover.tsx` | `@radix-ui/react-popover` |
| Progress | `lib/shadcn/Progress.tsx` | `@radix-ui/react-progress` |
| RadioGroup | `lib/shadcn/RadioGroup.tsx` | `@radix-ui/react-radio-group` |
| Resizable | `lib/shadcn/Resizable.tsx` | `react-resizable-panels` |
| ScrollArea | `lib/shadcn/ScrollArea.tsx` | `@radix-ui/react-scroll-area` |
| Select | `lib/shadcn/Select.tsx` | `@radix-ui/react-select` |
| Separator | `lib/shadcn/Separator.tsx` | `@radix-ui/react-separator` |
| Sheet | `lib/shadcn/Sheet.tsx` | `vaul` |
| Sidebar | `lib/shadcn/Sidebar.tsx` | `tw-animate-css` |
| Skeleton | `lib/shadcn/Skeleton.tsx` | (CSS) |
| Slider | `lib/shadcn/Slider.tsx` | `@radix-ui/react-slider` |
| Sonner | `lib/shadcn/Sonner.tsx` | `sonner` |
| Spinner | `lib/shadcn/Spinner.tsx` | (CSS) |
| Switch | `lib/shadcn/Switch.tsx` | `@radix-ui/react-switch` |
| Table | `lib/shadcn/Table.tsx` | (CSS) |
| Tabs | `lib/shadcn/Tabs.tsx` | `@radix-ui/react-tabs` |
| Textarea | `lib/shadcn/Textarea.tsx` | (CSS) |
| Toast | `lib/shadcn/Toast.tsx` | `@radix-ui/react-toast` |
| Toaster | `lib/shadcn/Toaster.tsx` | `@radix-ui/react-toast` |
| Toggle | `lib/shadcn/Toggle.tsx` | `@radix-ui/react-toggle` |
| ToggleGroup | `lib/shadcn/ToggleGroup.tsx` | `@radix-ui/react-toggle-group` |
| Tooltip | `lib/shadcn/Tooltip.tsx` | `@radix-ui/react-tooltip` |

### Unused packages in dependencies

| Package | Status |
|---------|--------|
| `cmdk` | Not used |
| `embla-carousel-react` | Not used |
| `input-otp` | Not used |
| `react-resizable-panels` | Not used |
| `sonner` | Not used |
| `vaul` | Not used |
| `tw-animate-css` | Verify (Sidebar used?) |

### Used components (do not remove)

- Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label
- cn, clsx, tailwind-merge

---

## Future Improvements

- [ ] Migrate from individual `@radix-ui/react-*` to meta-pkg `radix-ui` (like shadcn v4)
- [ ] Check lucide-react icons usage (may have unused icons)
- [ ] Evaluate Chart.tsx and recharts necessity
- [ ] Consider removing react-day-picker if not used