(function (ng) {


    //Crear componente de app
    var hogarComponent = {
        controllerAs: '$ctrl',
        template: '<div ng-include="$ctrl.loadTemplate()"></div>',
        $inject: ['$q', '$mdDialog', '$location'],
        require: {
            parent: '^sdApp'
        }
    }



    hogarComponent.controller = function hogarComponentControler($q, $mdDialog, $location) {
        vm = this;
        
        this.loadTemplate = function () {
            return "src/hogar/hogar.html";
        }
        
        this.$onInit = function () {
            function resizeIframe(obj) { 
                if (obj) {
                    if(obj.contentWindow.document.body != null) {
                        for(var i = 0; i < obj.contentWindow.document.body.children.length; i++) {
                            hijo = obj.contentWindow.document.body.children[i]
                            if(hijo.tagName == 'MAIN') {
                                obj.style.height = (hijo.scrollHeight + 50) + 'px';
                                // $('[layout="column"]').eq(0).css('height', hijo.clientHeight);
                                $('[layout="column"]').eq(0).css('height', hijo.scrollHeight);
                                return;
                            }
                        }
                    }
                }
            }
            function resizeTarifFrame(){
                    $('.iframe_tarificador').each(function(index){
                        var elem=$(this).get(0);
                        resizeIframe(elem);
                    });
                    setTimeout(resizeTarifFrame,250);
                }
                setTimeout( resizeTarifFrame, 500 );    
            }
        }

    

    

    ng.module('App').component('sdHogar', Object.create(hogarComponent));

})(window.angular);