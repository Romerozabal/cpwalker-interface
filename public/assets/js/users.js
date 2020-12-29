//var socket = io.connect('http://localhost:3000',{'forceNew':true});
const socket = io();

let sortDirection=false;

let personData=[
    {name: 'Gabriel', Apellido: 'Delgado'},
    {name: 'Miguel', Apellido: 'Andrade'},
    {name: 'Andres', Apellido: 'Abril'},
    
];

let datospacientes = [{
    idPacientes: 4,
    NombrePac: 'Paciente4',
    ApellidoPac: 'Apellido4',
    EdadPac: '5',
    PesoPac: '4',
    TallaPac: '90',
    idTerapeuta: 2,
    SesionNum: 1
  }];

let pacien=[{}];

socket.on('datostabla', function(datas) {


    for (var i = 0; i < datas.length; i++) {
        datospacientes.push(datas[i]);
    }
    console.log(datospacientes);
    pacien = datospacientes;


    let $dt = $('#userList');
    let dt = $dt.DataTable({
        "data": datospacientes,
        "columns": [
            {// Se ingresa el control para agregar columnas y observar mas detalles del paciente
                "className":      'details-control', // Se
                "orderable":      false,
                "data":           null,
                "width": '4%',
                "defaultContent":  ' <i class="fas fa-plus" style="color:#325AC8;" aria-hidden="true"></i>'  //ingreso el icono de más
            },
            {"width": '4%',
            render: function(data, type, full, meta) {
              // ACA controlamos la propiedad para des/marcar el input
              return "<input type='checkbox'" + (full.checked ? ' checked' : '') + "/>";
              
            },
            orderable: false
             },
            { data: 'NombrePac' },
            { data: 'ApellidoPac' },
            { data: 'EdadPac' },
            

        ]
            
            });

    // Cuando hacen click en el checkbox del thead
    $dt.on('change', 'thead input', function(evt) {
        let checked = this.checked;
        //let total = 0;
        let data = [];
  
        dt.data().each(function(info) {
          // ACA cambiamos el valor de la propiedad
          info.checked = checked;
          // ACA accedemos a las propiedades del objeto
         // if (info.checked) total += info.Precio;
          data.push(info);
        });
  
        dt.clear()
          .rows.add(data)
          .draw();
    });
  
      // Cuando hacen click en los checkbox del tbody
    $dt.on('change', 'tbody input', function() {
        let info = dt.row($(this).closest('tr')).data();
        // ACA accedemos a las propiedades del objeto
        info.checked = this.checked;
    });
    
    
    //  suscribimos un listener al click del boton obtener
    $('#btnObtener').on('click', function() {
      let dt = $('#userList').DataTable();
      let checkeds = dt.data().toArray().filter((data) => data.checked);
      console.log(checkeds);
    });


    // Listener al click en detalles de cada paciente
    dt.on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = dt.row( tr );
  
        if (row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.find('svg').attr('data-icon', 'plus');    // FontAwesome 5
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
          tr.find('svg').attr('data-icon', 'minus'); // FontAwesome 5
        }
    } );


    //Formate de DETALLES de cada paciente
    function format ( d ) {
        // `d` is the original data object for the row
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Peso:</td>'+
                '<td>'+d.PesoPac+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Altura:</td>'+
                '<td>'+d.TallaPac+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Extra info:</td>'+
                '<td>And any further details here (images etc)...</td>'+
            '</tr>'+
        '</table>';
    }

  })



$(document).ready(function() {
    //Asegurate que el id que le diste a la tabla sea igual al texto despues del simbolo #
 
               
    
});