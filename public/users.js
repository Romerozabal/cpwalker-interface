//var socket = io.connect('http://localhost:3000',{'forceNew':true});
const socket = io();

let sortDirection=false;

let personData=[
    {name: 'Gabriel', Apellido: 'Delgado'},
    {name: 'Miguel', Apellido: 'Andrade'},
    {name: 'Andres', Apellido: 'Abril'},
    
];

//let datospacientes = [{
 //   idPacientes: 4,
 //   NombrePac: 'Paciente4',
 //   ApellidoPac: 'Apellido4',
 //   EdadPac: '5',
 //   PesoPac: '4',
 //   TallaPac: '90',
 //   idTerapeuta: 2,
 //   SesionNum: 1
 // }];

  let datospacientes = [{
    idtabla_sesion: 4,
    date: '2020-12-22T15:49:59.000Z',
    idPaciente: 3,
    NumeroSesion: 1,
    idTerapeuta: 2,
    edad_paciente: 17,
    peso_paciente: 45,
    leg_length: 20,
    hip_upper_strap: 20,
    knee_lower_strap: 20,
    escala_clinica: '3',
    steps: 35,
    ROM: 50,
    cadence: 67,
    PBWS: 23,
    right_knee_config: 'posicion',
    left_knee_config: 'posicion',
    right_hip_config: 'impedancia 1',
    left_hip_config: 'impedancia 1',
    observaciones: 'triste',
    idtabla_pacientes: 3,
    NombrePaciente: 'María',
    ApellidoPaciente: 'Riveros',
    idtabla_terapeutas: 2,
    NombreTerapeuta: 'María',
    ApellidoTerapeuta: 'Jaramillo',
    Centro: 'CSIC'
  }];

  let listapacientes = [{
    idtabla_pacientes: 6,
    NombrePaciente: 'Gabriel',
    ApellidoPaciente: 'Delgado',
  }];

socket.emit('refreshlist');

socket.on('datostabla', function(datas) {


    //for (var i = 0; i < datas.length; i++) {
     //   datospacientes.push(datas[i]);
   // }
    console.log(datas);
    

    //Creación de DataTables
    let $dt = $('#userList');
    let dt = $dt.DataTable({
        "data": datas,
        "columns": [
            {// Se ingresa el control para agregar columnas y observar mas detalles del paciente
                "className":      'details-control', // Se
                "orderable":      false,
                "data":           null,
                "width": '4%',
                "defaultContent":  ' <i class="fas fa-plus" style="color:#325AC8;" aria-hidden="true"></i>'  //ingreso el icono de más
            },
            {"width": '4%',
            render: function(data, type, fullsessions, meta) {
              // ACA controlamos la propiedad para des/marcar el input
              return "<input type='checkbox'" + (fullsessions.checked ? ' checked' : '') + "/>";
            },
            orderable: false
             },
            { data: 'date' },
            { data: 'NombrePaciente' },
            { data: 'ApellidoPaciente'},
            { data: 'escala_clinica'},
            { data: 'NumeroSesion'},
            { data: 'NombreTerapeuta'},
            { data: 'ApellidoTerapeuta'},
            ],
            
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
  
    // Cuando hacen click en los checkbox del tbody SESSIONS
    $dt.on('change', 'tbody input', function() {
        let info = dt.row($(this).closest('tr')).data();
        // ACA accedemos a las propiedades del objeto
        info.checked = this.checked;
        //console.log(info.checked);
        if (this.checked){
            document.getElementById("remove_session").disabled = false;
            document.getElementById("download_session").disabled = false; 
            document.getElementById("view_session").disabled = false;
        }else{
            document.getElementById("remove_session").disabled = true;
            document.getElementById("download_session").disabled = true;
            document.getElementById("view_session").disabled = true;
        }       
    });

    // Listener al click en detalles de cada paciente en SESSIONS
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
    });

    //Formato de DETALLES de cada paciente.
    function format ( d ) {
      // `d` is the original data object for the row
      return '<table>'+
      '<thead>'+
        '<tr>'+
          '<th>Weight:</th>'+
          '<th>Age:</th>'+
          '<th>Leg Length:</th>'+
          '<th>Hip Upper Strap:</th>'+
          '<th>Knee Lower Strap:</th>'+
          '<th>Steps:</th>'+
          '<th>ROM:</th>'+
          '<th>Cadence:</th>'+
          '<th>PBWS:</th>'+
          '<th>Control Mode:</th>'+
          //'<th>Right Hip Config:</th>'+
          //'<th>Right Knee Config:</th>'+
          //'<th>Left Hip Config:</th>'+
          //'<th>Left Knee Config:</th>'+
          '<th>Observations:</th>'+
          
        '</tr>'+
      '</thead>'+
      '<tbody>'+
        '<tr>'+
          '<td>'+d.peso_paciente+'</td>'+
          '<td>'+d.edad_paciente+'</td>'+
          '<td>'+d.leg_length+'</td>'+
          '<td>'+d.hip_upper_strap+'</td>'+
          '<td>'+d.knee_lower_strap+'</td>'+
          '<td>'+d.steps+'</td>'+
          '<td>'+d.ROM+'</td>'+
          '<td>'+d.cadence+'</td>'+
          '<td>'+d.PBWS+'</td>'+
          '<td>'+d.right_hip_config+'</td>'+
          //'<td>'+d.right_knee_config+'</td>'+
          //'<td>'+d.left_hip_config+'</td>'+
          //'<td>'+d.left_knee_config+'</td>'+
          '<td>'+d.observaciones+'</td>'+
        '</tr>'+
      '</tbody>'+
      '</table>';




     // return '<table cellpadding="" cellspacing="0" border="0" style="padding-left:50px;">'+
     //     '<tr>'+
     //         '<td>Peso:</td>'+
     //         '<td>'+d.PesoPac+'</td>'+
     //     '</tr>'+
     //     '<tr>'+
     //         '<td>Altura:</td>'+
     //         '<td>'+d.TallaPac+'</td>'+
     //     '</tr>'+
     //     '<tr>'+
      //        '<td>Extra info:</td>'+
     //         '<td>And any further details here (images etc)...</td>'+
     //     '</tr>'+
     // '</table>';
  }

})




socket.on('patientdata',function(datapatient){

  //for (var i = 0; i < datapatient.length; i++) {
  //    listapacientes.push(datapatient[i]);
 // }
  //console.log(listapacientes);
  console.log(datapatient);


  let $pd = $('#patientsList');
  let pd = $pd.DataTable({
      "data": datapatient,
      "columns": [
          {"width": '4%',
          render: function(data, type, fullistapacientes, meta) {
            // ACA controlamos la propiedad para des/marcar el input
            return "<input type='checkbox'" + (fullistapacientes.checked ? ' checked' : '') + "/>";
          },
          orderable: false
           },
          { data: 'NombrePaciente' },
          { data: 'ApellidoPaciente'},
          ],

          
  });


        // Cuando hacen click en los checkbox del tbody
        $pd.on('change', 'tbody input', function() {
          let info = pd.row($(this).closest('tr')).data();
          // ACA accedemos a las propiedades del objeto
          info.checked = this.checked;
          if (this.checked){
              document.getElementById("edit_patient").disabled = false;
              document.getElementById("remove_patient").disabled = false;
              document.getElementById("download_list_patient").disabled = false;
          }else{
              document.getElementById("edit_patient").disabled = true;
              document.getElementById("remove_patient").disabled = true;
              document.getElementById("download_list_patient").disabled = true;

              //location.reload();
              //document.getElementById("home-tab").setAttribute("focus",true);
              
            
              //pd.clear().draw();
             // pd.rows.add(datapatient).draw();
          }
         
      });


    //  suscribimos un listener al click del boton del modal add patient
    $('#b_add_p').on('click', function() {
      let patfname = document.getElementById("FNPatient").value;
      let patlname = document.getElementById("LNPatient").value;
      console.log(patfname);
      socket.emit('insertPatient',[patfname, patlname]);
      //location.reload(true);
      $('#patientsList').DataTable().row.add({
          'NombrePaciente': patfname,
          'ApellidoPaciente': patlname,
      }).draw();
      //setTimeout(socket.emit('refreshlist'), 3000); 
      //datatable.data(datas).draw();
    });

        //  suscribimos un listener al click del boton remove
    $('#b_delete_p').on('click', function() {
        let dt = $('#patientsList').DataTable();
        let vars = dt.data().toArray();
        let checkeds = dt.data().toArray().filter((data) => data.checked);

        for (i = 0; i < vars.length; i++) {
            if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
              console.log(i);
              var indexrow = i;
            };
        };
        dt.row(indexrow).remove().draw();
        socket.emit('deleted_patient',checkeds[0].idtabla_pacientes);
    });

    $('#b_download_p').on('click', function() {
      socket.emit('download_patients');
      window.open('http://localhost:3000/downloadpatients');
    });


    $('#edit_patient').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].idtabla_pacientes);
          };
      };
      document.getElementById("editFNPatient").value = checkeds[0].NombrePaciente ;
      document.getElementById("editLNPatient").value =  checkeds[0].ApellidoPaciente;
    })

    $('#b_edit_p').on('click', function() {
      let dt = $('#patientsList').DataTable();
      let vars = dt.data().toArray();
      let checkeds = dt.data().toArray().filter((data) => data.checked);

      for (i = 0; i < vars.length; i++) {
          if (checkeds[0].idtabla_pacientes == vars[i].idtabla_pacientes){
            console.log(i);
            var indexrow = i;
            console.log(checkeds[0].idtabla_pacientes);
          };
      };
      
      checkeds[0].NombrePaciente = document.getElementById("editFNPatient").value;
      checkeds[0].ApellidoPaciente = document.getElementById("editLNPatient").value;

      dt.row(indexrow).remove().draw();
      $('#patientsList').DataTable().row.add({
        'NombrePaciente': checkeds[0].NombrePaciente,
        'ApellidoPaciente': checkeds[0].ApellidoPaciente,
      }).draw();
      
      socket.emit('edit_patient',checkeds[0]);
    });


})



socket.on('therapistdata',function(datatherapist){
  console.log(datatherapist);


  let $td = $('#therapistList');
  let td = $td.DataTable({
      "data": datatherapist,
      "columns": [
          {"width": '4%',
          render: function(data, type, fullistater, meta) {
            // ACA controlamos la propiedad para des/marcar el input
            return "<input type='checkbox'" + (fullistater.checked ? ' checked' : '') + "/>";
          },
          orderable: false
           },
          { data: 'NombreTerapeuta' },
          { data: 'ApellidoTerapeuta'},
          { data: 'Centro'},
          ],

          
  });




  // Cuando hacen click en los checkbox del tbody
  $td.on('change', 'tbody input', function() {
  let info = td.row($(this).closest('tr')).data();
  // ACA accedemos a las propiedades del objeto
  info.checked = this.checked;
      if (this.checked){
          document.getElementById("edit_therapist").disabled = false;
          document.getElementById("remove_therapist").disabled = false;
          //document.getElementById("download_list_therapist").disabled = false;
      }else{
          document.getElementById("edit_therapist").disabled = true;
          document.getElementById("remove_therapist").disabled = true;

      }
  
  });
  
  //ADD THERAPIST
  $('#b_add_t').on('click', function() {
      let therfname = document.getElementById("FNTherapist").value;
      let therlname = document.getElementById("LNTherapist").value;
      let center = document.getElementById("Center").value;
      console.log(therfname);
      socket.emit('insertTherapist',[therfname, therlname, center]);
      $('#therapistList').DataTable().row.add({
          'NombreTerapeuta': therfname,
          'ApellidoTerapeuta': therlname,
          'Centro': center,
      }).draw();
  });
  
  //  DELET THERAPIST
  $('#b_delete_t').on('click', function() {
    let dt = $('#therapistList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtabla_terapeutas == vars[i].idtabla_terapeutas){
          console.log(i);
          var indexrow = i;
        };
    };
    dt.row(indexrow).remove().draw();
    socket.emit('deleted_therapist',checkeds[0].idtabla_terapeutas);
  });

  $('#edit_therapist').on('click', function() {
    let dt = $('#therapistList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtabla_terapeutas == vars[i].idtabla_terapeutas){
          console.log(i);
          var indexrow = i;
          console.log(checkeds[0].idtabla_terapeutas);
        };
    };
    document.getElementById("editFNTherapist").value = checkeds[0].NombreTerapeuta ;
    document.getElementById("editLNTherapist").value =  checkeds[0].ApellidoTerapeuta;
    document.getElementById("editCenter").value =  checkeds[0].Centro;
  })

  $('#b_edit_t').on('click', function() {
    let dt = $('#therapistList').DataTable();
    let vars = dt.data().toArray();
    let checkeds = dt.data().toArray().filter((data) => data.checked);

    for (i = 0; i < vars.length; i++) {
        if (checkeds[0].idtabla_terapeutas == vars[i].idtabla_terapeutas){
          console.log(i);
          var indexrow = i;
          console.log(checkeds[0].idtabla_terapeutas);
        };
    };
    
    checkeds[0].NombreTerapeuta = document.getElementById("editFNTherapist").value;
    checkeds[0].ApellidoTerapeuta = document.getElementById("editLNTherapist").value;
    checkeds[0].Centro = document.getElementById("editCenter").value;

    dt.row(indexrow).remove().draw();
    $('#therapistList').DataTable().row.add({
      'NombreTerapeuta': checkeds[0].NombreTerapeuta,
      'ApellidoTerapeuta': checkeds[0].ApellidoTerapeuta,
      'Centro': checkeds[0].Centro
    }).draw();
    
    socket.emit('edit_therapist',checkeds[0]);
  });


  $('#b_download_t').on('click', function() {
    socket.emit('download_therapist');
    window.open('http://localhost:3000/downloadtherapists');
  });


})


$(document).ready(function() {
    //Asegurate que el id que le diste a la tabla sea igual al texto despues del simbolo #
  });