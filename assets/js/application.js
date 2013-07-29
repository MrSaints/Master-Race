var showdown = new Showdown.converter();
var home = angular.module('home', ['ngSanitize']);

/*
 * Config
 */
home.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {templateUrl: 'tpl/index.html',   controller: IndexCtrl}).
        when('/:year/:slug', {templateUrl: 'tpl/post.html', controller: PostCtrl}).
        otherwise({redirectTo: '/404'});
}]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.responseInterceptors.push('httpInterceptor');
}]);

/*
 * Filters
 */
home.filter('timeago', function() {
    return function(date, default_date) {
        date = !date ? default_date : $.timeago(date);
        return date;
    }
});

/* 
 * Factories
 */
home.factory('posts', function($http) {
    return $http.get('posts.json');
});
home.factory('httpInterceptor', function ($q, $location) {
    return function(promise) {
        // Success
        return promise.then(function(response) {
            return response;
        }, function(response) {
            // Error
            if (response.status === 404) {
                $location.path('/404');
            }
            return $q.reject(response);
        });
    }
});

/*
 * Controllers
 */
function IndexCtrl ($scope, posts) {
    $scope.posts = [];
    posts.success(function(data) {
        $scope.posts = data;
    });
}

function PostCtrl ($scope, $routeParams, $http, $filter, posts) {
    var current;

    $scope.nextPost = [];
    $scope.previousPost =  [];

    posts.success(function(data) {
        current = data.indexOf($filter('filter')(data , $routeParams.slug)[0]);
        $scope.nextPost = data[current + 1];
        $scope.previousPost = data[current - 1];
    });

    $scope.content = '';
    $http.get('posts/' + $routeParams.year + '/' + $routeParams.slug + '.md').success(function (data) {
        $scope.content = showdown.makeHtml(data);
    });
}

/*
 * jQuery
 */
$(function () {
    var $nav = $('.head__navigation');
    $(window).scroll(function () {
        if ($(this).scrollTop() > $('.fix-nav').first().outerHeight() - $nav.first().outerHeight())
            $nav.addClass('head__navigation--fixed');
        else
            $nav.removeClass('head__navigation--fixed');
    });
}(jQuery));