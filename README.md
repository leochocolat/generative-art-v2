# Generative Art V2

## Getting started

### Setup the correct node version

```bash
nvm use
```

### Install dependencies

```bash
pnpm install
```

### Start working

```bash
pnpm run dev
```

### Build

```bash
pnpm run build
```

## Use static assets

Static assets should be place in the /public folder.

## UI

### Templating

We're using [handlebars](https://handlebarsjs.com/) for HTML templating.

- `./src/views/template.hbs` HTML layout
- `./src/views/app.hbs` Application root
- `./src/pages` pages folder
- `./src/components` components folder

Feel free to add more folder with your own preferences.

### UI Components

To create a javascript component linked to a UI element you can use the component factory.
In your handlebars component just add a data attribute "component" : 

```html
<div data-component="my-component-name"></div>
```

Then in folder `@/src/components` duplicate the `Sample.js` file and rename it to `MyComponentName.js` (don't forget to also rename the class in the file).

Then go to `@/src/ComponentFactory.js` and add your component : 

```js
***

const COMPONENTS = {
    'my-component-name': () => import('./components/MyComponentName'),
};

***
```

Your component class extends from the `ComponentUI class`. It allows you to access different things : 

- `this.$app` Root application
- `this.$el` HTML Element linked to the component
- `this.$name` Component name
- `this.$refs` All HTML elements inside the component element that have the "ref" data attribute :

```html
<div data-component="my-component-name">

    <h1 data-ref="heading">

        Title

    </h1>

</div>
```

`ComponentUI` also extends from `EventDispatcher` so every component can dispatch events : 

```js
this.dispatchEvent('hello', { john: 'doe' })
```

## Debugger

You can find the debugger class in `./src/script/utils/debugger`.

We use [Tweakpane](https://cocopon.github.io/tweakpane/) GUI with some utils and extra features on top of it.

### [tweakpane-plugin-media](https://github.com/leochocolat/tweakpane-plugin-media)

### Drag feature

You can drag the debugger around by clicking on the title button. 

### Save feature

Sometimes it's useful to be able to save the value you just tweaked using the debugger.

To do that, multiple steps are required: 

- Add a .env file in your project:
(The value XXX will be replaced automatically with your local public ip)

```bash
# Debugger server
VITE_DEBUGGER_SERVER_IP=XXX
VITE_DEBUGGER_SERVER_PORT=9999
```

- Have a settings.js file

It can be global or bounded to a component, modules etc..

It needs a file key with the full path to the settings file, example:

```js
export default {
    file: `./src/script/webgl/components/ComponentBox/settings.js`,
    scale: 10 
}
```

- Have a save event on the debugger wherever you have some settings to save, example:

```js
import settings from '@/webgl/components/ComponentBox/settings';

this.$debugger.on('save', () => {
    this.$debugger.save(settings, settings.file).then((e) => {
        if (e.status === 200) console.log(`Successfully saved file: ${settings.file}`);
    });
});
```

#### Some more explanations:

When you run the dev server, a debugger node server is also run (`./debugger-server.js`) waiting for a post request to get the settings object with the modifications and rewritting the js file accordingly.

## WebGL

### Scenes

In `@/src/script/webgl/scenes` you'll find a template scene folder, you can copy paste this folder and rename it with your scene name. You should also rename the class and config name property.

Then in `@/src/script/webgl/scenes/index.js`, import your scene and add it to the exported object : 

```js
import SceneSample from './SceneSample';
import SceneYourSceneName from './SceneYourSceneName';

export default {
    // Main Scene
    'main': SceneSample,
    // Scenes
    'Sample': SceneSample,
    'YourSceneName': SceneYourSceneName
};
```

Now that this is done, you can visualize your scene using the scene query url and the name of your scene : **localhost:5174/?scene=YourSceneName**

### Cameras

In `@/src/script/webgl/modules` you'll find a CameraManager class, it's useful to enable/disable different types of cameras when working on a scene.

For example you might need an orbit control camera but also a default one for you scene... 

The camera settings, position, rotation are saved in the localstorage, it's useful to speedup development processes. When you want to go back to the default settings just click the reset button.
