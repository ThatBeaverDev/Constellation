## Main Syntax

Tokens are separated by a space. Splitting can be prevented with a backslash.

Valid:

```javascript
const name = "hi";
```

Invalid:

```javascript
const name = "hi";
```

# Types

Types are as follows:

- String
- Number
- Boolean
- List
- Object

## Variables

Assignments can have three declarations: `let`, `const` and `global`.

`let`, as in Javascript, is a reassignable variable.

`const`, as in Javascript yet again, is a constant variable.

`global` is a constant global, accessible from anywhere

Examples of assignment:

```js
// constant
const constant = "words"

// non-readonly variable
let modifyable = "rewritable"

// global
global thing = "value"

// rewriting let variable
modifyable = "see?"
```
