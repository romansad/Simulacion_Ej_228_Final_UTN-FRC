/// <reference path="sim-0.26.js" />
myApp = angular.module('myApp', ['ui.bootstrap']);
myApp.service('myService', function ($timeout) {

    this.Alert = function (dialogText, dialogTitle) {
        var alertModal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog"> <div class="modal-dialog"> <div class="modal-content" style="width: 80%;"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">×</button> <h3>' + (dialogTitle || 'Atencion') + '</h3> </div> <div class="modal-body"><p>' + dialogText + '</p></div><div class="modal-footer"><button class="btn" data-dismiss="modal">Cerrar</button></div></div></div></div>');
        $timeout(function () { alertModal.modal(); });
    };

    this.Confirm = function (dialogText, okFunc, cancelFunc, dialogTitle, but1, but2) {
        var confirmModal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog"> <div class="modal-dialog"> <div class="modal-content" style="width: 80%;"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">×</button> <h3>' + dialogTitle + '</h3> </div> <div class="modal-body">' + dialogText + '</div><div class="modal-footer"><button ID="SiBtn" class="btn" data-dismiss="modal">' + (but1 == undefined ? 'Si' : but1) + '</button><button ID="NoBtn" class="btn" data-dismiss="modal">' + (but2 == undefined ? 'No' : but2) + '</button></div></div></div></div>');
        confirmModal.find('#SiBtn').click(function (event) {
            okFunc();
            confirmModal.modal('hide');
        });
        confirmModal.find('#NoBtn').click(function (event) {
            cancelFunc();
            confirmModal.modal('hide');
        });
        $timeout(function () { confirmModal.modal(); });
    };
    // bloqueo / desbloqueo de pantalla
    var contadorBloqueo = 0;
    var $dialog = $(
        '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
        '<div class="modal-dialog modal-m">' +
        '<div class="modal-content">' +
        '<div class="modal-header"><h3 style="margin:0;">Aguanta la mecha por favor...</h3></div>' +
        '<div class="modal-body">' +
        '<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
        '</div></div></div></div>');

    this.BloquearPantalla = function () {
        contadorBloqueo++;
        if (contadorBloqueo == 1)
            $dialog.modal();
    };
    this.DesbloquearPantalla = function () {
        contadorBloqueo--;
        if (contadorBloqueo == 0)
            $timeout(function () { $dialog.modal('hide'); }, 100); //dentro de un timeout para que angular actualice la pantalla
    };
})
// ref interceptor de peticiones ajax
// usado para interceptar llamadas ajax y para bloquear/desbloquear pantalla y; mostrar msj de error
myApp.factory('myHttpInterceptor', function ($q, myService) {
    // factory retorna un objeto
    var myHttpInterceptor = {
        request: function (config) {
            myService.BloquearPantalla();
            return config;
        },
        requestError: function (config) {
            return config;
        },
        response: function (response) {
            myService.DesbloquearPantalla();
            return response;
        },
        responseError: function (response) {
            myService.DesbloquearPantalla();
            // acceso denegado generado por alguna llamada al servidor (no carga las vistas)
            if (response.status == 404 || response.status == 401) {
                myService.Alert("Acceso Denegado...");
            }
            else if (response.status == 400) {
                myService.Alert("Peticion incorrecta...");
            }
            else if (response.data && response.data.ExceptionMessage) {
                // error desde webapi
                myService.Alert(response.data.ExceptionMessage);
            }
            else {
                myService.Alert("Error en la aplicacion, reintente nuevamente.");
            }
            return $q.reject(response);
        }
    }
    return myHttpInterceptor;
})
    // configura la app con el interceptor antes creado
    .config(function ($httpProvider) {
        //agrega el inteceptor definido anteriormente
        $httpProvider.interceptors.push('myHttpInterceptor');
    });


myApp.run(function ($rootScope, $http, $location, myService) {
    // $rootScope desde donde heredan todos los $scope de los controladores
    // todas las variables o funciones que se definan aquí están disponibles en todos los controladores
    $rootScope.TituloAccionABMC = { A: '(Agregar)', B: '(Eliminar)', M: '(Modificar)', C: '(Consultar)', L: null };
    $rootScope.Mensajes = { SD: ' No se encontraron registros...', RD: ' Revisar los datos ingresados...' };
});

myApp.controller('InicioCtrl', function ($scope) {
    $scope.Titulo = '– FACULTAD REGIONAL CÓRDOBA -';
    $scope.Titulo2 = 'MATERIA: SIMULACIÓN';
    $scope.Titulo3 = 'Ejercicio 228';
});
//Aqui empieza lo groso de simulacion...
myApp.controller('Simular1', function ($scope, $http, myService) {
    $scope.Media = 3;
    $scope.Horas = 12;
    $scope.Evento_nro = 45;
    
    $scope.AccionABMC = 'Pulse Iniciar';   //Funcion inicialmente Muestra Cambio 1.

    //Solo Para mostrar la fila seleccionada
    $scope.setClickedRow = function (index) {
        $scope.selectedRow = index;
    }
        //Funcion de Limpieza de Grilla
    $scope.Limpiar = function () {
        var Evento = 0;
        var Reloj = 0;
        var RND_LL_Cliente = 0;
        var T_entre_LL_Cliente = 0;
        var Prox_LL_Cliente = 0;
        var Rnd_Cant_Prod = 0;
        var Cantidad_Prod = 0;
        var P_Estado = "";
        var P_RND_T_Atencion = 0;
        var P_T_Atencion = 0;
        var P_Hora_Fin_Atencion = 10000000;
        var Cola = 0;
        var Ac_Clientes_Atendidos = 0;
        var Ac_Clientes_SinAtencion = 0;
        var Stock_Actual = 0;
        var Estado_Horno = 0;
        var Hora_Inicio_Coccion = 0;
        var Tiempo_Coccion = 0;
        var Hora_Fin_Coccion = 0;
        var Proxima_Hora_Coccion_Programada = 0;
        var Hora_Inicio_Espera = 0;

        $scope.items = [{Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera}];
           }
    $scope.Resumen = function () {
        $scope.AccionABMC = 'R';
    }

    $scope.Volver = function () {
        $scope.AccionABMC = 'L';
    }
        
    $scope.Iniciar = function () {
        params = { Horas: $scope.Horas, Media: $scope.Media, Evento_nro: $scope.Evento_nro };
       // $scope.Horas = 12; //Ver Cantidad de Horas a Simular
        //$scope.Eventos = 200;
        //$scope.Evento_nro = 45;
        $scope.AccionABMC = 'L';

        var apartir = params.Evento_nro;
        var Media = -1 * params.Media;
        var Horas = params.Horas; //Por Un Rato VOy a Hardcodear en 4 horas. para resolver elerror
        //var Horas = 24;
        var nro = 0;
        var Evento = 'Inicio';
        var Reloj = 0;
        var RND_LL_Cliente = 0;
        var T_entre_LL_Cliente = 0;
        var Prox_LL_Cliente = 0;
        var Rnd_Cant_Prod = 0;
        var Cantidad_Prod = 0;
        var P_Estado = "";
        var P_RND_T_Atencion = 0;
        var P_T_Atencion = 0;
        var P_Hora_Fin_Atencion = 10000000;
        var Cola = 0;
        var Ac_Clientes_Atendidos = 0;
        var Ac_Clientes_SinAtencion = 0;
        var Stock_Actual = 0;
        var Estado_Horno = "";
        var Hora_Inicio_Coccion = 0;
        var Tiempo_Coccion = 0;
        var Hora_Fin_Coccion = 0;
        var Proxima_Hora_Coccion_Programada = 0;
        var Hora_Inicio_Espera = 0; //Hora inicio espera de cada cliente
        //Array Clientes Hora Inicio 
        var Array_Hs_Inicio_Espera = [];
       //Variables temporales
        var Flag_RK_P_45 = 0; //Bandera horno para 45 productos usada en condicion de fin coccion
        var Flag_RK_P_30 = 0; //Bandera horno para 30 productos usada en condicion de fin coccion
        var Contador_ll_Clientes = 0;
        var Ac_Espera_Mayor_a_5 = 0;
        var Ac_Vaciamiento_Cola = 0;
        //Primer Evento 
        if (Reloj == 0) {
            Evento = 'Inicio';
            nro += 1;
            RND_LL_Cliente = Math.random();
            T_entre_LL_Cliente = Math.log(1 - RND_LL_Cliente) * (Media);
            Prox_LL_Cliente = Reloj + T_entre_LL_Cliente;
            //Panadero;
            P_Estado = "Libre";
            P_RND_T_Atencion = 000;
            P_T_Atencion = 000;
            P_Hora_Fin_Atencion = 10000000;
            Cola = 0;
            Ac_Clientes_Atendidos = 0;
            Ac_Clientes_SinAtencion = 0;
            Stock_Actual = params.Evento_nro;
            Estado_Horno = "Apagado";
            Hora_Inicio_Coccion = 000;
            $scope.items = [{nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera}];
           // $scope.items2 = [{ Reloj }];
        }
        while (Reloj/60 < Horas) {
            Reloj_Anterior = Reloj;
            // Eventos de fin Atencion inicio , fin de coccion e incio de coccion
            if (Hora_Fin_Coccion > 0 && Hora_Fin_Coccion < P_Hora_Fin_Atencion && Hora_Fin_Coccion < Prox_LL_Cliente) {
                Reloj = Hora_Fin_Coccion;
                Evento = "Fin_Coccion";
                nro += 1;
                Estado_Horno = "Apagado";
                Hora_Inicio_Coccion = 0;
                Tiempo_Coccion = 0;
                Hora_Fin_Coccion = 0;
                Proxima_Hora_Coccion_Programada = Reloj + 35;
                if (Flag_RK_P_45 == 1) {
                    Stock_Actual += 45;
                    Flag_RK_P_45 = 0; //Apago flags de cantidad de prod a cocinar
                }
                else {
                    Stock_Actual += 30;
                    Flag_RK_P_30 = 0
                }
                $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                 // ||||||||||||||||||||||||| Llamar a un cliente de cola si hay, ni bien termina de cocinar |||||||||||||||||||||||||
                if (Cola > 0) {
                    Array_Hs_Inicio_Espera.shift();
                    Cola -= 1;
                   // AHora se Genera Atencion!
                    if (Stock_Actual > 0) {
                        //Cantidad de Productos a comprar
                        Rnd_Cant_Prod = Math.random();
                        if (Rnd_Cant_Prod < 0.25) {
                            Cantidad_Prod = 1;
                        } else if (Rnd_Cant_Prod < 0.50) {
                            Cantidad_Prod = 2;
                        } else if (Rnd_Cant_Prod < 0.75) {
                            Cantidad_Prod = 3;
                        }
                        else { Cantidad_Prod = 4; }
                        Stock_Actual -= Cantidad_Prod;
                        if (Stock_Actual < 0) { Stock_Actual = 0; }
                        P_Estado = "Atendiendo";
                        P_RND_T_Atencion = Math.random();
                        P_T_Atencion = 0.5 + P_RND_T_Atencion * 1;
                        P_Hora_Fin_Atencion = P_T_Atencion + Reloj;
                        Evento = "Inicio Atencion de cola";
                        nro += 1;
                        $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                      }
                }
                //||||||||||||||||||  Fin Generacion llamada a cliente de cola |||||||||||||||||||||||||||
                               
            } //Fin True hora Fin de Coccion  Ahora verificamos si la hora programada de inicio de coccion ha llegado.
            else if (Proxima_Hora_Coccion_Programada < Prox_LL_Cliente && Estado_Horno == "Apagado") {
                Estado_Horno = "Encendido";
                Hora_Inicio_Coccion = Proxima_Hora_Coccion_Programada;
                //En el sig if definimos Tiempo de coccion por RK =8.5 minutos y flags por cantidad de producto
                if (Stock_Actual > 0) {
                    Flag_RK_P_30 = 1;
                    Tiempo_Coccion = 6 + 18;
                    Hora_Fin_Coccion = Hora_Inicio_Coccion + Tiempo_Coccion;
                    Proxima_Hora_Coccion_Programada = Hora_Fin_Coccion + 35;
                }
                else {
                    Flag_RK_P_45 = 1;
                    Tiempo_Coccion = 5.85 + 18;
                    Hora_Fin_Coccion = Hora_Inicio_Coccion + Tiempo_Coccion;
                    Proxima_Hora_Coccion_Programada = Hora_Fin_Coccion + 35;
                }

                if (Hora_Inicio_Coccion < Prox_LL_Cliente && Hora_Inicio_Coccion < P_Hora_Fin_Atencion) {
                    nro += 1;
                    Evento = "Inicio de Coccion";
                    Reloj = Hora_Inicio_Coccion;
                    $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                }
                //Observar que el RK esta hardcodeado en 8.5 minutos. para ambos stock's
            } // Final  de coccion Programada.

            //*****************   Ahora trataré el Evento Fin Atencion!!!
            while (P_Hora_Fin_Atencion < Prox_LL_Cliente) {
                
                Reloj = P_Hora_Fin_Atencion;
                Evento = "Fin Atencion";
                nro += 1;
                Ac_Clientes_Atendidos += 1;
                P_Estado = "Libre";
                P_Hora_Fin_Atencion = 10000000;
                P_RND_T_Atencion = 0;
                P_T_Atencion = 0;
                //if (Evento == "Inicio de Coccion") {
                //    nro += 1;
                //    Evento = "Inicio de Coccion";
                //    Reloj = Hora_Inicio_Coccion;
                //    $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                //}

                $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });

                if (Cola > 0) {
                    //Array_Hs_Inicio_Espera.shift();   //Solamente Voy aAtender si Hay Stock sino debo esperar con lo cual no eliminaria ningun objeto del array
                    //Cola -= 1;
                      // AHora se Genera Atencion!
                    if (Stock_Actual > 0) {
                        Array_Hs_Inicio_Espera.shift();
                        Cola -= 1;
                        Rnd_Cant_Prod = Math.random();
                        if (Rnd_Cant_Prod < 0.25) {
                            Cantidad_Prod = 1;
                        } else if (Rnd_Cant_Prod < 0.50) {
                            Cantidad_Prod = 2;
                        } else if (Rnd_Cant_Prod < 0.75) {
                            Cantidad_Prod = 3;
                        }
                        else { Cantidad_Prod = 4; }
                         Stock_Actual -= Cantidad_Prod;
                        if (Stock_Actual < 0) { Stock_Actual = 0; }
                        P_Estado = "Atendiendo";
                        P_RND_T_Atencion = Math.random();
                        P_T_Atencion = 0.5 + P_RND_T_Atencion * 1;
                        P_Hora_Fin_Atencion = P_T_Atencion + Reloj;
                        Evento = "Inicio Atencion de cola";
                        nro += 1;
                        $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                    }
                    else //Else Stock_Actual es = 0
                    { //El encendido del Horno lo Controlo en la llegada del cliete y no en el fin de atencion.  
                    }

                }
                //VerEsto Luego que no lo entiendo a este if   ()&$#&($)&#/&#$#&$(=&$#(=#&$#$&))
                //else if (Evento=="Llegada de Cliente") {
                //    Cola += 1;
                //    Array_Hs_Inicio_Espera.push(Reloj);
                //}
            }  //Fin Evento fin de atencion While (P_Hora_Fin_Atencion < Prox_LL_Cliente)

            //Siguiente caso de Final de coccion  con tiempo posterior al fin de atencion.
            if (Hora_Fin_Coccion < Prox_LL_Cliente && Hora_Fin_Coccion > 0) {
                Reloj = Hora_Fin_Coccion;
                Evento = "Fin_Coccion";
                nro += 1;
                Estado_Horno = "Apagado";
                Hora_Inicio_Coccion = 0;
                Tiempo_Coccion = 0;
                Hora_Fin_Coccion = 0;
                Proxima_Hora_Coccion_Programada = Reloj + 35;
                if (Flag_RK_P_45 == 1) {
                    Stock_Actual += 45;
                    Flag_RK_P_45 = 0; //Apago flags de cantidad de prod a cocinar
                }
                else {
                    Stock_Actual += 30;
                    Flag_RK_P_30 = 0
                }
                $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
               }

     //********\\\\\\\\\\\^-^ EL EVENTO LLEGADA DE CLIENTE ^-^ /////////***************
            //Primero corroborare si hay clientes con mas de 5 cinco min esperando 
            Array_Hs_Inicio_Espera.forEach(Func_Elementos);
            function Func_Elementos(value) {
                if (Prox_LL_Cliente - value > 5 && Stock_Actual ==0) {
                    Array_Hs_Inicio_Espera.shift();
                    Cola -= 1;
                    console.log("Se Elimina por exceso de tiempo de espera :" + value);
                    Ac_Clientes_SinAtencion += 1;
                    Ac_Espera_Mayor_a_5 += 1;
                    Evento = "Cliente s/Atencion espera desde" + value.toFixed(3);
                    Reloj = value + 5;
                    nro += 1;
                    $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                    
                }
            }
            Evento = 'Llegada de CLiente';
            nro += 1;
            Reloj = Prox_LL_Cliente;
            RND_LL_Cliente = Math.random();
            T_entre_LL_Cliente = Math.log(1 - RND_LL_Cliente) * (Media);
            Prox_LL_Cliente = Reloj + T_entre_LL_Cliente;
            Contador_ll_Clientes += 1; //Contador total de clientes sean o no atendidos.
            //Control de Cola
             if (P_Estado == "Libre") {
                    if (Stock_Actual > 0) {
                        //Cantidad de Productos a comprar
                        Rnd_Cant_Prod = Math.random();
                        if (Rnd_Cant_Prod < 0.25) {
                            Cantidad_Prod = 1;
                        } else if (Rnd_Cant_Prod < 0.50) {
                                Cantidad_Prod = 2;
                            } else if (Rnd_Cant_Prod < 0.75) {
                                    Cantidad_Prod = 3;
                                }
                                else { Cantidad_Prod = 4; }
                            Stock_Actual -= Cantidad_Prod;
                            if (Stock_Actual < 0) { Stock_Actual = 0; } //En este if cuando se quedan sin stock debo vaciar la cola si hay cola ...
                            P_Estado = "Atendiendo";
                            P_RND_T_Atencion = Math.random();
                            P_T_Atencion = 0.5 + P_RND_T_Atencion * 1;
                            P_Hora_Fin_Atencion = P_T_Atencion + Reloj;
                        }
                    else //Else Stock Actual es = 0
                    {
                     Cola += 1;
                     Array_Hs_Inicio_Espera.push(Reloj);
                    if (Estado_Horno == "Apagado")
                        {
                            Estado_Horno = "Encendido";
                            Hora_Inicio_Coccion = Reloj;
                            Flag_RK_P_45 = 1;
                            Tiempo_Coccion = 5.85 + 18;
                            Hora_Fin_Coccion = Hora_Inicio_Coccion + Tiempo_Coccion;
                        Proxima_Hora_Coccion_Programada = Hora_Fin_Coccion + 35;
                        nro += 1;
                        $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
                        
                        }
                    }
                } //Fin if true panadero libre
                else //Panadero esta atendiendo
                {
                 Cola += 1;
                 Array_Hs_Inicio_Espera.push(Reloj);
                } //FIn Panadero Libre
            // } FIn If Cola >0 de tratamient de cliente
          $scope.items.push({ nro, Evento, Reloj, RND_LL_Cliente, T_entre_LL_Cliente, Prox_LL_Cliente, Rnd_Cant_Prod, Cantidad_Prod, P_Estado, P_RND_T_Atencion, P_T_Atencion, P_Hora_Fin_Atencion, Cola, Ac_Clientes_Atendidos, Ac_Clientes_SinAtencion, Stock_Actual, Estado_Horno, Hora_Inicio_Coccion, Tiempo_Coccion, Hora_Fin_Coccion, Proxima_Hora_Coccion_Programada, Hora_Inicio_Espera });
         } //Llave Cierre de While
        //Resumen
        $scope.Contador_ll_Clientes = Contador_ll_Clientes;
        $scope.Proporcion = ((Ac_Clientes_SinAtencion) / Contador_ll_Clientes ) * 100;
        $scope.Proporcion_Atendidos = (Ac_Clientes_Atendidos / Contador_ll_Clientes) * 100;
        $scope.Atendidos = Ac_Clientes_Atendidos;
        $scope.No_Atendidos = Ac_Clientes_SinAtencion;
        $scope.Esperas = Ac_Espera_Mayor_a_5;
        $scope.Vaciamiento = Ac_Vaciamiento_Cola;
       }
    });