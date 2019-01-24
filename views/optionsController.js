//chrome.storage.local.remove('sets');

angular.module('mtgPriceTracker', ['ui.bootstrap'])
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
.controller('optionsController', ['$scope', '$http', function($scope, $http){
	$scope.filterModel = { 
		price : 0.01, 
		set: { id:'grn' },
		c: true,
		u: true,
		r: true,
		m: true,
		s: true,
		width: 230
	};

	$scope.pages = {
                itemsPerPage: 400,
                currentPage: 1,
                totalItems: 0
            };

    $http({method: 'GET', url: '/api/cards'}).
        then(function success(data) {
        	$scope.sets = data.data;
    });

	$scope.cardFilter = function( criteria ) {
	  return function( item ) {
	  	if (!item){
	  		return true;
	  	}
	    return item.price >= criteria.price && criteria[item.rarity] && (!criteria.z || item.priceHistory.length < 2 || item.priceHistory[item.priceHistory.length - 2].price == 0);
	  };
	};

	$scope.setFilter = function( criteria ) {
	  return function( item ) {
	    return !criteria.set || !criteria.set.id || item.id === criteria.set.id;
	  };
	};
}]);