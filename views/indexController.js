angular.module('mtgPriceTracker', ['ui.bootstrap'])
    .filter('page', () => {
        return (arr, page, items) => {
            const start = (page - 1) * items
            const end = page * items
            return (arr || []).slice(start, end)
        }
    })
    .filter('selectmany', () => {
        return (arr, attr) => {
            let result = []
            for (let i = (arr || []).length - 1; i >= 0; i--) {
                result = result.concat(arr[i][attr])
            }
            return result
        }
    })
    .controller('optionsController', ['$scope', '$http', ($scope, $http) => {
        $scope.filterModel = {
            price: 0.01,
            set: {id: 'eld'},
            c: true,
            u: true,
            r: true,
            m: true,
            s: true,
            width: 230,
            z: new Date('1000-01-01')
        }

        $scope.pages = {
            itemsPerPage: 400,
            currentPage: 1,
            totalItems: 0
        }

        $http({method: 'GET', url: '/api/sets'}).then(function success(data) {
            $scope.sets = data.data
        })

        $scope.$watch('filterModel.set', function () {
            $http({method: 'GET', url: '/api/set/' + $scope.filterModel.set.id}).then(function success(data) {
                $scope.set = data.data
            })
        })

        $scope.cardFilter = (criteria) => {
            return (item) => {
                if (!item) {
                    return true
                }
                if (criteria.inLib && !item.inLib) return false
                if (item.price < criteria.price || !criteria[item.rarity])
                    return false
                let i = 0
                while (i < item.priceHistory.length && new Date(item.priceHistory[i].date) <= criteria.z) i++
                return i === 0 || item.priceHistory[i - 1].price === 0
            }
        }

        $scope.setFilter = (criteria) => {
            return (item) => {
                return !criteria.set || !criteria.set.id || item.id === criteria.set.id
            }
        }

        $scope.updatePrice = () => {
            $scope.updatingPrice = true
            $http({method: 'GET', url: '/api/parseSale'}).then(function success(data) {

                $http({method: 'GET', url: '/api/sets'}).then(function success(data) {
                    $scope.sets = data.data
                })

                $scope.updatingPrice = false
            })
        }

        $scope.setInLib = (card, inLib) => {
            $http({
                method: 'GET',
                url: '/api/set/' + card.setId + '/card/' + card.id + '/setInLib/' + inLib
            }).then(function success(data) {
                card.inLib = inLib
            })
        }
    }])