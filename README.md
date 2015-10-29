angular-modal-service2
======================

```
bower install angular-modal-service2
```

## Usage

```js
// In your controller
// note use of `@ngInject` flag for ng-annotate
// which prevents minification problems
ModalService.showModal({
    templateUrl: '/templates/modal.html',
    controller: /*@ngInject*/ function($modal, data) {
        var ctrl = this;

        ctrl.data = data;

        ctrl.clickClose = function(data) {
        	$modal.close(data);
        };
    },
    controllerAs: 'ctrl',
    inputs: {
        data: data
    }
}).then(function(modal) {
	modal.result.then(function(data) {
		console.log(data);
	})
});
```

```html
<!-- modal.html -->
<div class="modal-backdrop" ng-click="$modal.dismiss()"></div>

<div class="modal">
<div class="modal-dialog">
<div class="modal-content">

<div class="modal-header">
	<button class="right btn btn-default btn-sm btn-round"
		ng-click="$modal.dismiss()">
		<span class="mdi mdi-lg mdi-close"></span>
	</button>
	<h4 class="modal-title">Modal</h4>
</div>

<div class="modal-body">

	<pre>{{ctrl.data}}</pre>

</div>

<div class="modal-footer">
	<button type="button"
		class="btn btn-default"
		ng-click="ctrl.clickClose(ctrl.data)">Close</button>
</div>

</div>
</div>
</div>

```