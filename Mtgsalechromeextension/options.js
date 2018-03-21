//chrome.storage.local.remove('sets');

angular.module('mtgSaleExtension', ['ui.bootstrap'])
.filter('page', function () {
    return function (arr, page, items) {
        var start = (page - 1) * items;
        var end = page * items;
        return (arr || []).slice(start, end);
    };
})
.filter('selectmany', function () {
    return function (arr, attr) {
    	var result = [];
    	for (var i = (arr || []).length - 1; i >= 0; i--) {
    		result = result.concat(arr[i][attr]);
    	};
        return result;
    };
})
.controller('optionsController', ['$scope', function($scope){
	$scope.filterModel = { 
		price : 0.01, 
		set: { id:'emn' },
		c: true,
		u: true,
		r: true,
		m: true,
		s: true,
		width: 200
	};

	$scope.pages = {
                itemsPerPage: 400,
                currentPage: 1,
                totalItems: 0
            };

	chrome.storage.local.get('sets', function(sets){
		sets = sets.sets  || mtgData;
		$scope.sets = sets;

		chrome.storage.local.get('setDiff', function(setDiff) {
			setDiff = setDiff.setDiff;
			for (var i = sets.length - 1; i >= 0; i--) {
				var set = sets[i];
				var diff = setDiff[set.id];
				for (var j = set.c.length - 1; j >= 0; j--) {
					var c = set.c[j];
					if (diff.c[c.id].p != c.p){
						c.ph.push({ date: new Date().toISOString(), p: diff.c[c.id].p });
						c.p = diff.c[c.id].p;
					}
				};
			};
			$scope.$apply();
			chrome.storage.local.set({'sets': sets });
		});

	});

	$scope.cardFilter = function( criteria ) {
	  return function( item ) {
	    return item.p >= criteria.price && criteria[item.r] && (!criteria.z || item.ph.length < 2 || item.ph[item.ph.length - 2].p == 0);
	  };
	};

	$scope.setFilter = function( criteria ) {
	  return function( item ) {
	    return !criteria.set || !criteria.set.id || item.id === criteria.set.id;
	  };
	};
}]);