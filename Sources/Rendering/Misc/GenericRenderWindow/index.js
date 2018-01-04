import macro from 'vtk.js/Sources/macro';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';

// Load basic classes for vtk() factory
import 'vtk.js/Sources/Common/Core/Points';
import 'vtk.js/Sources/Common/Core/DataArray';
import 'vtk.js/Sources/Common/DataModel/PolyData';
import 'vtk.js/Sources/Rendering/Core/Actor';
import 'vtk.js/Sources/Rendering/Core/Mapper';

function vtkGenericRenderWindow(publicAPI, model) {
  // Capture resize trigger method to remove from publicAPI
  const invokeResize = publicAPI.invokeResize;
  delete publicAPI.invokeResize;

  // VTK renderWindow/renderer
  model.renderWindow = vtkRenderWindow.newInstance();
  model.renderer = vtkRenderer.newInstance();
  model.renderWindow.addRenderer(model.renderer);

  // OpenGlRenderWindow
  model.openGlRenderWindow = vtkOpenGLRenderWindow.newInstance();
  model.renderWindow.addView(model.openGlRenderWindow);

  // Interactor
  model.interactor = vtkRenderWindowInteractor.newInstance();
  model.interactor.setView(model.openGlRenderWindow);
  model.interactor.initialize();

  // Expose background
  publicAPI.setBackground = model.renderer.setBackground;

  // Update BG color
  publicAPI.setBackground(...model.background);

  // Handle window resize
  publicAPI.resize = () => {
    if (model.container) {
      const dims = model.container.getBoundingClientRect();
      model.openGlRenderWindow.setSize(
        Math.floor(dims.width),
        Math.floor(dims.height)
      );
      invokeResize();
      model.renderWindow.render();
    }
  };

  // Handle DOM container relocation
  publicAPI.setContainer = (el) => {
    if (model.container) {
      model.openGlRenderWindow.setContainer(model.container);
      model.interactor.unbindEvents(model.container);
    }

    // Switch container
    model.container = el;

    // Bind to new container
    if (model.container) {
      model.openGlRenderWindow.setContainer(model.container);
      model.interactor.bindEvents(model.container);
    }
  };

  // Handle size
  if (model.listenWindowResize) {
    window.addEventListener('resize', publicAPI.resize);
  }
  publicAPI.resize();
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  background: [0.32, 0.34, 0.43],
  listenWindowResize: true,
  container: null,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Object methods
  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, [
    'renderWindow',
    'renderer',
    'openGlRenderWindow',
    'interactor',
    'container',
  ]);
  macro.event(publicAPI, model, 'resize');

  // Object specific methods
  vtkGenericRenderWindow(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
