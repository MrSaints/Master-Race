var showdown = new Showdown.converter();
var home = angular.module('home', ['ngSanitize']);
var $defaultTitle = 'Ian Lai';

/*
 * Config
 */
home.config(function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/', {templateUrl: 'tpl/index.html',   controller: IndexCtrl}).
        when('/about', {templateUrl: 'tpl/about.html',   controller: AboutCtrl}).
        when('/:year/:slug', {templateUrl: 'tpl/post.html', controller: PostCtrl}).
        otherwise({redirectTo: '/404'});
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $httpProvider.responseInterceptors.push('httpInterceptor');
});

/*
 * Filters
 */
home.filter('timeago', function () {
    return function(date, default_date) {
        date = !date ? default_date : $.timeago(date);
        return date;
    }
});

/* 
 * Factories
 */
home.factory('title', function () {
    var $title = $defaultTitle;
    return {
        getTitle: function () {
            return $title;
        },
        setTitle: function ($newTitle) {
            $title = $newTitle;
        },
        prependDefault: function ($prepend) {
            $title = $prepend + ' &mdash; ' + $defaultTitle;
        }
    }
});
home.factory('posts', function ($http) {
    return $http.get('_posts/posts.json');
});
home.factory('httpInterceptor', function ($q, $location) {
    return function (promise) {
        // Success
        return promise.then(function (response) {
            return response;
        }, function (response) {
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
function TitleCtrl ($scope, title) {
    $scope.title = title;
}

function IndexCtrl ($scope, title, posts) {
    title.setTitle($defaultTitle);
    $scope.posts = [];
    posts.success(function(data) {
        $scope.posts = data;
    });
}

function AboutCtrl ($scope, title) {
    title.prependDefault('About');
}

function PostCtrl ($scope, $routeParams, $http, $filter, title, posts) {
    var $current;

    $scope.nextPost = [];
    $scope.previousPost =  [];

    posts.success(function(data) {
        $current = data.indexOf($filter('filter')(data , $routeParams.slug)[0]);
        title.prependDefault(data[$current].title);
        
        $scope.nextPost = data[$current + 1];
        $scope.previousPost = data[$current - 1];
    });

    $scope.content = '';
    $http.get('_posts/' + $routeParams.year + '/' + $routeParams.slug + '.md').success(function (data) {
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