(function() {

  'use strict';

  var module = angular.module('hj.modal', []);

  module.factory('ModalService', ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateCache', '$timeout',
    function($document, $compile, $controller, $http, $rootScope, $q, $templateCache, $timeout) {

      // Get the body of the document, we'll add the modal to this.
      var body = angular.element($document[0].body);

      function ModalService() {

        var self = this;

        //  Returns a promise which gets the template, either
        //  from the template parameter or via a request to the
        //  templateUrl parameter.
        var getTemplate = function(template, templateUrl) {
          var deferred = $q.defer();

          if (template) {
            deferred.resolve(template);

          } else if (templateUrl) {
            //  Check to see if the template has already been loaded.
            var cachedTemplate = $templateCache.get(templateUrl);

            if (cachedTemplate) {
              deferred.resolve(cachedTemplate);

            } else {
              //  If not, let's grab the template for the first time.
              $http.get(templateUrl).then(function(result) {

                //  Save template into the cache and return the template.
                $templateCache.put(templateUrl, result.data);

                deferred.resolve(result.data);

              }, function(error) {
                deferred.reject(error);
              });
            }

          } else {
            deferred.reject('No template or templateUrl has been specified.');
          }

          return deferred.promise;
        };

        self.showModal = function(options) {

          options.showingClass = options.showingClass || 'hj-modal--showing';

          //  Create a deferred we'll resolve when the modal is ready.
          var deferred = $q.defer();

          //  Get the actual html of the template.
          getTemplate(options.template, options.templateUrl)
            .then(function(template) {

              //  Create a new scope for the modal.
              var modalScope = $rootScope.$new();

              modalScope.$scope = modalScope;

              //  Create the inputs object to the controller - this will include
              //  the scope, as well as all inputs provided.
              //  We will also create a deferred that is resolved with a provided
              //  close function.
              var closeDeferred = $q.defer();

              var close = function(result, delay) {
                delay = delay || 0;

                preCleanup();

                $timeout(function() {

                  //  Resolve the 'close' promise.
                  closeDeferred.resolve(result);

                  cleanup();

                }, delay);
              };

              var dismiss = function(delay) {
                delay = delay || 0;

                preCleanup();

                $timeout(function() {

                  //  Reject the 'close' promise.
                  closeDeferred.reject();

                  cleanup();

                }, delay);
              };

              var preCleanup = function() {
                if (options.appendElement) {
                  $timeout(function() {
                    options.appendElement.removeClass(options.showingClass);
                  });

                } else {
                  $timeout(function() {
                    body.removeClass(options.showingClass);
                  });
                }
              };

              var cleanup = function() {
                //  We can now clean up the scope
                modalScope.$destroy();

                //  ... and remove the element from the DOM
                modalElement.remove();

                //  ... and finally remove keydown listener.
                $document.off('keydown', keyDownHandler);
              };

              modalScope.$modal = {
                close: close,
                dismiss: dismiss,
              };

              var keyDownHandler = function(e) {
                //  Listen for escape key and dismiss modal.
                if (e.keyCode === 27) {
                  dismiss();
                }
              };

              $document.on('keydown', keyDownHandler);

              //  TODO: resolve any promises in options.inputs

              var inputs = options.inputs || {};

              var controller = options.controller;

              //  Pass inputs to scope.
              modalScope = angular.extend(modalScope, inputs);

              var modalController;

              if (typeof controller === 'string' && options.controllerAs) {
                //  If a 'controllerAs' option has been provided, we change the controller
                //  name to use 'as' syntax. $controller will automatically handle this.
                controller = controller + ' as ' + options.controllerAs;
              }

              if (typeof controller !== 'function') {
                //  If controller has been defined in options then we manually inject
                //  inputs/dependencies for safe minification
                angular.injector.$$annotate(controller);
              }

              //  Create the controller, explicitly specifying the scope to use.
              modalController = $controller(controller || function() {}, modalScope);

              if (options.controllerAs) {
                if (typeof controller !== 'string') {
                  //  If a 'controllerAs' option has been provided, and a controller is
                  //  defined make the controller available on the scope under this name.
                  modalScope[options.controllerAs] = modalController;
                }

                if (!controller) {
                  //  If no controller has been defined just pass the inputs to the
                  //  'controllerAs' variable on the scope
                  modalScope[options.controllerAs] = inputs;
                }
              }

              //  Parse the modal HTML into a DOM element (in template form).
              var modalElementTemplate = angular.element(template);

              //  Compile then link the template element, building the actual element.
              //  Set the $element on the inputs so that it can be injected if required.
              var linkFn = $compile(modalElementTemplate);

              var modalElement = linkFn(modalScope);

              modalScope.$element = modalElement;

              //  Finally, append the modal to the dom.
              var appendElement = options.appendElement ? options.appendElement : body;

              appendElement.append(modalElement);

              $timeout(function() {
                appendElement.addClass(options.showingClass);
              });

              //  We now have a modal object...
              var modal = {
                controller: modalController,
                scope: modalScope,
                element: modalElement,
                result: closeDeferred.promise,
                close: close,
                dismiss: dismiss,
              };

              //  ...which is passed to the caller via the promise.
              deferred.resolve(modal);

            })
            .then(null, function(error) { // 'catch' doesn't work in IE8.
              deferred.reject(error);
            });

          return deferred.promise;
        };

      }

      return new ModalService();
    },
  ]);

}());

