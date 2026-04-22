# Convention for naming

## React

### React Component name

CamelCase

examples: `App`, `CommonInput`

### React Component internal const

lowerCamelCase

#### React Component internal boolean const

`is` + CamelCase

examples: `isLoading`, `isInvalid`

#### React Component external handler function

`on` + CamelCase

examples: `onClick`, `onClose`

#### React Component internal handler function

`handle` + CamelCase

examples: `handleClick`, `handleOpen`

### React Hook

`use` + CamelCase

examples: `useStore`, `useInject`

## Typescript

### Enum

`E` + CamelCase

_note: set the name as a single value, not as multiple values!_

bad example: ~~`ERoles`~~, ~~`EAthenaPriorities`~~

good examples: `ERole`, `EAthenaPriority`

### Interface

`I` + CamelCase

examples: `IAPIResponse`, `IComponent`

### Type

`T` + CamelCase

examples: `TAPISearchParams`

#### React Functional Component type

`I` + ComponentName

examples: `ILandCard` // for LandCard fc component
