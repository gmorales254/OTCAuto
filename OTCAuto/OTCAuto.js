//# sourceURL=OTCAuto.js
preBindTab(null); //Don't delete this line

//CONFIGURATION CONST:
const config = {
  defaultPreview: 'OTCAuto_Scheduler->', //for scheduled calls
  closeForm: {
    active: false,
    timeInMs: 300000
  },
  historyLimit: 5,
  saveWithoutDispo: true,
  inpts: ["txtID",
  "txtFullname",
  "txtPhone",
  "txtEmail",
  "txtSalesrep",
  "txtCustom1",
  "txtCampaignid",
  "txtMake",
  "txtModel",
  "txtYear"]
};



var language = parent.language;
var options = {
  lng: language,
  resGetPath: "translation_" + language + ".json"
};

i18n.init(options, function (t) {
  $("body").i18n();
  init();
});


//Variables globables:
var fileArray = [];
var GUID = "";
var hayMasTipificaciones = true;
var globalaction = "";
var customerFound = '';
var callid = '';


// REACT FORM VALIDATOR ACÁ... /////////////////////////////////////////////////////////////////

const reactform = document.getElementById('reactform');
const inputs = document.querySelectorAll('#reactform input');

const expresiones = {
  texto: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // Letras y espacios, pueden llevar acentos.
  correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // correo
  telefono: /^\d{7,13}$/, // 7 a 13 numeros
  alphanumeric: /^[a-zA-Z0-9_\s]*$/, //alfanumerico
  num: /^\d{4}$/, // 4 digitos
}
const fields = new Object;

const formValidation = async (e) => {
  switch (e.target.name) {
    case "ID":
      fieldValidation(expresiones.alphanumeric, e.target, 'txtID', true);
      break;
    case "fullname":
      fieldValidation(expresiones.texto, e.target, 'txtFullname', false);
      break;
    case "email":
      fieldValidation(expresiones.correo, e.target, 'txtEmail', false);

      if(!fields.txtEmail || !e.target.value) return; 
      let respi = JSON.parse(await UC_get_async(`SELECT id_customer FROM ccrepo.OTCAuto_customers WHERE email = "${e.target.value}" LIMIT 1`, ""));
      if (respi && respi[0].id_customer != customerFound) {

        swal(i18n.t('CRMLite.emailFound'),
        i18n.t('CRMLite.emailFoundSub'),
          {
            buttons: {
              cancel: true,
              confirm: "Ok"
            },
            closeOnClickOutside: false,
          }).then((res) => {
            if (res) {
              loadCustomer(respi[0].id_customer);
            } else {
              e.target.value = "";
            }
          });

      }
      break;

    case "phone":
      fieldValidation(expresiones.telefono, e.target, 'txtPhone', true);

      if(!fields.txtPhone  || !e.target.value) return;
      
      let resp = JSON.parse(await UC_get_async(`SELECT id_customer FROM ccrepo.OTCAuto_customers WHERE phone = "${e.target.value}" LIMIT 1`, ""));
      if (resp && resp[0].id_customer != customerFound) {

        swal(i18n.t('CRMLite.phoneFound'),
          i18n.t('CRMLite.phoneFoundSub'),
          {
            buttons: {
              cancel: true,
              confirm: "Ok"
            },
            closeOnClickOutside: false,
          }).then((res) => {
            if (res) {
              loadCustomer(resp[0].id_customer);
            } else {
              e.target.value = "";
            }
          });

      }

      break;
    case "salesrep":
      fieldValidation(expresiones.alphanumeric, e.target, 'txtSalesrep', false);
      break;
    case "custom1":
      fieldValidation(expresiones.alphanumeric, e.target, 'txtCustom1', false);
      break;
    case "campaignID":
      fieldValidation(expresiones.alphanumeric, e.target, 'txtCampaignid', false);
      break;
    case "make":
      fieldValidation(expresiones.alphanumeric, e.target, 'txtMake', false);
      break;
    case "model":
      fieldValidation(expresiones.alphanumeric, e.target, 'txtModel', false);
      break;
    case "year":
      fieldValidation(expresiones.num, e.target, 'txtYear', false);
      break;
  }
}

const fieldValidation = (expresion, input, campo, required) => {

  if (required === false && !input.value) {
    document.getElementById(campo).classList.remove('input-error');
    document.getElementById(campo).classList.add('input-correcto');
    fields[campo] = true;
  } else {

    if (expresion.test(input.value)) {
      document.getElementById(campo).classList.remove('input-error');
      document.getElementById(campo).classList.add('input-correcto');
      fields[campo] = true;
    } else {
      document.getElementById(campo).classList.remove('input-correcto');
      document.getElementById(campo).classList.add('input-error');
      fields[campo] = false;
    }

  }

}


inputs.forEach((input) => {
  input.addEventListener('keyup', formValidation);
  input.addEventListener('blur', formValidation);
});

function manualFormValidation() {

  fieldValidation(expresiones.alphanumeric, document.getElementById('txtID'), 'txtID', true);
  fieldValidation(expresiones.texto, document.getElementById('txtFullname'), 'txtFullname', false);
  fieldValidation(expresiones.correo, document.getElementById('txtEmail'), 'txtEmail', false);
  fieldValidation(expresiones.telefono, document.getElementById('txtPhone'), 'txtPhone', true);
  fieldValidation(expresiones.alphanumeric, document.getElementById('txtSalesrep'), 'txtSalesrep', false);
  fieldValidation(expresiones.alphanumeric, document.getElementById('txtCustom1'), 'txtCustom1', false);
  fieldValidation(expresiones.alphanumeric, document.getElementById('txtCampaignid'), 'txtCampaignid', false);
  fieldValidation(expresiones.alphanumeric, document.getElementById('txtMake'), 'txtMake', false);
  fieldValidation(expresiones.alphanumeric, document.getElementById('txtModel'), 'txtModel', false);
  fieldValidation(expresiones.num, document.getElementById('txtYear'), 'txtYear', false);

}


async function ReactcheckValidity() {
  return !Object.values(fields).includes(false);
}

// FORM REACT FINISH..............

// SPEACH
document.getElementById('btnSpeach').addEventListener('click', async () => {
  let camp = document.getElementById('cmbCampaign').value;
  if(!camp){
    notification('Warning', "You don't select a campaign", "fa fa-warning", "warning");
    return;
  }

  let resp = JSON.parse(await UC_get_async(`SELECT speach FROM ccrepo.OTCAuto_speach WHERE queuename = '${camp.split(' ')[0]}'`,''));
  if(resp.length == 0){
    notification('Warning', "This campaign don't have a speach yet", "fa fa-warning", "warning");
    return;
  }

  let speach = resp[0].speach;
  speach = speach.replace("{{fullname}}", document.getElementById('txtFullname').value);
  speach = speach.replace("{{id}}", document.getElementById('txtID').value);
  speach = speach.replace("{{salesrep}}", document.getElementById('txtSalesrep').value);
  speach = speach.replace("{{email}}", document.getElementById('txtEmail').value);
  speach = speach.replace("{{custom1}}", document.getElementById('txtCustom1').value);
  speach = speach.replace("{{phone}}", document.getElementById('txtPhone').value);
  speach = speach.replace("{{campaignid}}", document.getElementById('txtCampaignid').value);
  speach = speach.replace("{{make}}", document.getElementById('txtMake').value);
  speach = speach.replace("{{model}}", document.getElementById('txtModel').value);
  speach = speach.replace("{{year}}", document.getElementById('txtYear').value);
  speach = speach.replace("{{agent}}", parent.agent.fullname);
  
  swal({
  title: "Speach",
  text:  speach
});

})

// SEARCH 
document.getElementById('btnSearch').addEventListener('click', async () => {
  if (!document.getElementById('txtSearch').value) {
    notification(i18n.t('CRMLite.warning'), i18n.t("CRMLite.emptyField"), "fa fa-warning", "warning");
    return null;
  }

  let resp = await loadCustomer(document.getElementById('txtSearch').value, true);
  if (resp != 0) {
    swal(i18n.t('CRMLite.congrats'),
  `${i18n.t('CRMLite.canLoadCustomer')} (${resp.name})`,
      {
        buttons: {
          cancel: true,
          confirm: "Load it for me!"
        },
        closeOnClickOutside: false,
      }).then((res) => {
        if (res) {
          loadCustomer(resp.id_customer);
        }
      });

  } else {
    swal(i18n.t('CRMLite.customerDontFound'),
    i18n.t('CRMLite.tryLater'), {
        buttons: {
          confirm: "OK"
        }
      });
  }
});



// SAVE
document.getElementById('btnSave').addEventListener('click', async () => {
  manualFormValidation();

  if (!hayMasTipificaciones) {

    if (!config.saveWithoutDispo || config.saveWithoutDispo && callid || !customerFound) {
      let resp = await saveContactInfo();
      if (resp === false) {
        return false;
      }
    }

    if (globalaction === 'BLACKLIST') {
      await addToBlacklist();
    } else if (globalaction === 'RESCHEDULE') {

      if (!document.getElementById('dateframe').value) {
        notification(i18n.t('CRMLite.sorry'), i18n.t('CRMLite.chooseSchedule'), 'fa fa-warning', 'warning');
        return;
      }
      await makeReschedule();
    }

    let campana = document.getElementById('cmbCampaign').value.split(' ')[0];
    let can = document.getElementById('cmbCampaign').value.split(' ')[1];
    let canal = can.substring(1, can.length - 1);


    if (GUID) {
      let tag = '';
      if (document.getElementById('cmbRes1').value) tag = document.getElementById('cmbRes1').value;
      if (document.getElementById('cmbRes2').value) tag += "|" + document.getElementById('cmbRes2').value;
      if (document.getElementById('cmbRes3').value) tag += "|" + document.getElementById('cmbRes3').value;
      let objSave = new Object();
      objSave.channel = canal;
      objSave.dateprocessed = moment().format("YYYY-MM-DD HH:mm:ss");
      objSave.agent = parent.userid;
      objSave.value1 = document.getElementById('cmbRes1').value;
      objSave.value2 = document.getElementById('cmbRes2').value;
      objSave.value3 = document.getElementById('cmbRes3').value;
      objSave.guid = GUID;
      objSave.campaign = campana;
      objSave.comment = document.getElementById('txtNote').value;
      objSave.data1 = "callid: " + callid;
      objSave.data2 = "";
      objSave.callerid = document.getElementById('txtPhone').value;
      let guardado = await UC_Save_async(objSave, "ccrepo.dispositions_repo", "");

      UC_TagRecord(GUID, tag);

      if (guardado !== "OK") {
        notification(i18n.t('CRMLite.sorry'), i18n.t('CRMLite.operationError'), 'fa fa-times', 'danger');
        return;
      }

    }

    // manejo de las dispositions sobre OTCAuto_management >

    let cliente = await loadCustomer(document.getElementById('txtPhone').value, true);

    let objMang = {
      id_customer: cliente.id_customer,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      agent: parent.agent.accountcode,
      lvl1: document.getElementById('cmbRes1').value,
      lvl2: document.getElementById('cmbRes2').value,
      lvl3: document.getElementById('cmbRes3').value,
      note: document.getElementById('txtNote').value,
      queuename: campana,
      channel: canal,
      guid: GUID,
      callid: callid
    }

    let ress = await UC_Save_async(objMang, 'OTCAuto_management', '');

    if (ress === "OK") {

      notification(i18n.t('CRMLite.congrats'), i18n.t('CRMLite.saveManagment'), 'fa fa-success', 'success');
      UC_closeForm();

    }
  } else {
    notification(i18n.t("CRMLite.warning"), i18n.t("CRMLite.dispoError"), 'fa fa-times', 'danger');
  }

});

document.getElementById('btnContactSave').addEventListener('click', async () => {
  manualFormValidation();
  let resp = await saveContactInfo();
  if (resp) {
    UC_closeForm();
  }
})


//Save contacto info ()
async function saveContactInfo() {

  if (await ReactcheckValidity()) {

    //parseo mi array de archivos a una cadena de string sola para guardar en la base:
    let fileArrayParse = "";
    if (fileArray.length) {
      fileArray.map((item, pos, comp) => {
        fileArrayParse += item;
        if (pos < comp.length - 1) fileArrayParse += "|";
      });

    }
    //............................................................................

    const customerData = {
      id_customer: customerFound ? customerFound : null,
      ID: document.getElementById("txtID").value,
      fullname: document.getElementById("txtFullname").value,
      phone: document.getElementById("txtPhone").value,
      email: document.getElementById("txtEmail").value,
      salesrep: document.getElementById("txtSalesrep").value,
      custom1: document.getElementById("txtCustom1").value,
      campaignid: document.getElementById("txtCampaignid").value,
      make: document.getElementById("txtMake").value,
      model: document.getElementById("txtModel").value,
      year: document.getElementById("txtYear").value,
      files: fileArrayParse,
      active: 1,
      agent: parent.userid,
      date: moment().format('YYYY-MM-DD hh:mm:ss')
    }

    if (customerFound) { //debo actualizar
      let resp = UC_update_async(customerData, 'OTCAuto_customers', 'id_customer', '');
      console.log("updated response: " + resp);
    } else { //genero este usuario como nuevo
      let resp = UC_Save_async(customerData, 'OTCAuto_customers', '');
      console.log("saved response: " + resp);
    }

    notification(i18n.t('CRMLite.congrats'), i18n.t("CRMLite.saveManagment"), "fa fa-success", "success")
    return true;

  } else {
    notification(i18n.t("CRMLite.warning"), i18n.t("CRMLite.formInvalid"), "fa fa-warning", "warning");
    return false;
  }
}

//makeReschedule
async function makeReschedule() {
  if (document.getElementById('dateframe').value) {
    let callerid = document.getElementById('txtPhone').value;
    let querypart = `WHERE destination like '%${document.getElementById('txtPhone').value}%' OR (alternatives <> '' 
      AND (alternatives like '%${document.getElementById('txtPhone').value}%' 
      OR alternatives like '%${document.getElementById('txtPhone').value}%'))`;

    let queryC = `DELETE FROM ccdata.calls_spool ${querypart}`;
    let queryS = `DELETE FROM ccdata.calls_scheduler ${querypart}`;
    await UC_exec_async(queryC, '');
    await UC_exec_async(queryS, '');

    let resp = await UC_exec_async(`INSERT INTO ccdata.calls_scheduler (id, calldate, campaign, destination, agentphone) VALUES(null, 
                '${moment(document.getElementById('dateframe').value).format('YYYY-MM-DD hh:mm:ss')}', 
                '${config.defaultPreview}', '${callerid}', ${parent.agent.name})`, '');
  }
}

// BLACKLIST Add
async function addToBlacklist() {
  let objeto = new Object();
  objeto.phone = document.getElementById('txtPhone').value;
  objeto.campaign = '*';
  objeto.username = parent.userid;
  objeto.lastchaged = moment().format("YYYY-MM-DD HH:mm:ss");

  let querypart = `WHERE destination like '%${document.getElementById('txtPhone').value}%' OR (alternatives <> '' 
    AND (alternatives like '%${document.getElementById('txtPhone').value}%' OR alternatives like '%${document.getElementById('txtPhone').value}%'))`;
  let queryC = `DELETE FROM ccdata.calls_spool ${querypart}`;
  let queryS = `DELETE FROM ccdata.calls_scheduler ${querypart}`;
  await UC_exec_async(queryC, '');
  await UC_exec_async(queryS, '');
  UC_Save(objeto, 'ccdata.black_list', '', () => audit(`The user ${parent.userid} insert ${document.getElementById('txtPhone').value} to BlackList`));

}


//Limpiar todos los fields del react form o eliminar el usuario en caso de encontrarlo>
document.getElementById('btnClean').addEventListener('click', async () => {
  if (!customerFound) {
    reactform.reset();
  } else {
    swal(i18n.t("CRMLite.warning"), i18n.t("CRMLite.sureDelete"), 'warning', {
      buttons: {
        cancel: true,
        confirm: "OK"
      }
    }).then(async (res) => {
      if (res) {
        let resp = await UC_exec_async(`DELETE FROM OTCAuto_customers WHERE id_customer = ${customerFound}`, '');
        let respi = await UC_exec_async(`DELETE FROM OTCAuto_management WHERE id_customer = ${customerFound}`, '');
        if (resp == "OK") {
          swal(i18n.t("CRMLite.congrats"), i18n.t("CRMLite.deleteCustomerOk"), 'success');
          reactform.reset();
          UC_closeForm();
        } else {
          swal('Ups!', i18n.t("CRMLite.operationError"), 'warning');
        }
      }

    })
  }
})

//Realizar llamadas con el boton del icono phone >
document.getElementById('phoneAddon').addEventListener('click', () => {
  if (!document.getElementById('txtPhone').value) {
    notification('Ups!', i18n.t("CRMLite.phoneEmpty"), 'fa fa-warning', 'warning');
  } else {
    UC_makeCall_async("", "", Number(document.getElementById('txtPhone').value))
  }
})


//Agregar un archivo de tipo link
document.getElementById('bdgNewfile').addEventListener('click', () => {
  swal({
  title: `${i18n.t('CRMLite.addFileTitle')}: 1/2`,
    content: {
      element: "input",
      attributes: {
        placeholder: i18n.t('CRMLite.addFile1'),
        type: "text",
        id: 'inpDocName',
        required: true
      },
    },
    buttons: {
      cancel: true,
      confirm: "Confirm"
    },
    closeOnClickOutside: false,
  }).then((urlname) => {

    if (urlname) {
      swal({
        title: `${i18n.t('CRMLite.addFileTitle')}: 2/2`,
        content: {
          element: "input",
          attributes: {
            placeholder: i18n.t('CRMLite.addFile2'),
            type: "text",
            id: 'inpUrlDoc'
          },
        },
        buttons: {
          cancel: true,
          confirm: "Confirm"
        },
        closeOnClickOutside: false,
      }).then((urlpath) => {


        let expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        let regexUrl = new RegExp(expression);

        if (urlpath && regexUrl.test(urlpath.replace(/ /g, ""))) {
          loadFiles(`${urlname.replace(/ /g, "")}>${urlpath.replace(/ /g, "")}`); //le quito los espacios y lo mando
        } else {
          swal({
            title: 'The URL is invalid, please, check again'
          })
          return;
        }

      });
    } else {
      swal({
        title: 'You dont type the file name'
      })
      return;
    }

  });
})

// Funcion inicial >>
//Oculto elementos que no se utilizaran hasta el momento de cargar todo>
async function init() {

  reactform.reset();
  document.getElementById('dateframe').min = moment().format('YYYY-MM-DDThh:mm');
  //config para cerrar el form despues de X tiempo
  if (config.closeForm.active) {
    setTimeout(() => {
      UC_closeForm();
    }, config.closeForm.timeInMs)
  }

  document.getElementById('datediv').style.display = 'none';
  document.getElementById("cntHistory").style.display = 'none';
  document.getElementById("btnContactSave").style.display = 'none';



  if (config.saveWithoutDispo === true && !CTI) {
    document.getElementById("btnContactSave").style.display = 'block';
  }



  await loadCampaigns();

  if (CTI && JSON.parse(CTI).Channel) {
    // Canales disponibles: 
    // messenger (callerid numero interaccion de fb), 
    // webchat (callerid > correo),
    // sms (caller > celular),
    // email (callerid > email).

    let CTIParse = JSON.parse(CTI);

    if (CTIParse.Channel === "email" || CTIParse.Channel === "webchat") {
      if (CTIParse.Channel === "email") {

        document.getElementById('txtEmail').value = CTIParse.Callerid
        GUID = CTIParse.Guid;
        document.getElementById('cmbCampaign').value = `${CTIParse.Campaign} (email)`;
        document.getElementById('cmbCampaign').disabled = true;
        completarD1();
        callid = CTIParse.Callerid
      } else {

        document.getElementById('txtEmail').value = CTIParse.Callerid
        GUID = CTIParse.Guid;
        document.getElementById('cmbCampaign').value = `${CTIParse.Campaign} (webchat)`;
        document.getElementById('cmbCampaign').disabled = true;
        completarD1();
        callid = CTIParse.Callerid
      }
      await loadCustomer(CTIParse.Callerid);
    } else if (CTIParse.Channel === "sms") {

      document.getElementById('txtPhone').value = CTIParse.Callerid
      GUID = CTIParse.Guid;
      document.getElementById('cmbCampaign').value = `${CTIParse.Campaign} (sms)`;
      document.getElementById('cmbCampaign').disabled = true;
      completarD1();
      callid = CTIParse.Callerid

      await loadCustomer(CTIParse.Callerid);
    } else {
      GUID = CTIParse.Guid;
      document.getElementById('cmbCampaign').value = `${CTIParse.Campaign} (messenger)`
      document.getElementById('cmbCampaign').disabled = true;
      completarD1();
      callid = CTIParse.Callerid
      notification(i18n.t('CRMLite.sorry'), i18n.t('CRMLite.cantloadMsg'), 'fa fa-info', 'info');
    }

  } else if (CTI) {
    //Canal de llamada
    let CTIParse = JSON.parse(CTI);

    document.getElementById('txtPhone').value = CTIParse.Callerid
    GUID = CTIParse.Guid;
    console.log(`${CTIParse.Campaign} (telephony)`);

    document.getElementById('cmbCampaign').value = `${CTIParse.Campaign} (telephony)`
    document.getElementById('cmbCampaign').disabled = true;
    completarD1();
    await loadCustomer(CTIParse.Callerid);

    callid = CTIParse.Callerid;

    if (CTIParse.ParAndValues) {
      let ParAndValuesArray = CTIParse.ParAndValues.split(':')
      ParAndValuesArray.map((item) => {

        let parval = item.split('=')
        if (config.inpts.includes(parval[0])) {
          document.getElementById(`${parval[0]}`).value = `${parval[1]}`;
        } else {

        }

      });
    }
  } else {
    //Sin interaccion
    console.log("Sin interaccion activa");
    document.getElementById('cmbCampaign').disabled = false;
    callid = ""
  }


}

//Carga de todas las campañas:
async function loadCampaigns() {
  let campaigns = [];
  //telefonia
  let channelCall = JSON.parse(await UC_getMyAgentCampaigns_async())
  if (channelCall.length) channelCall.map((item) => campaigns.push(`${item} (telephony)`));
  //email
  let channelEmail = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.email_members WHERE agent = '${parent.agent.accountcode}'`))
  if (channelEmail.length) channelEmail.map((item) => campaigns.push(`${item.name} (email)`));
  //messenger
  let channelMessenger = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.messenger_members WHERE agent = '${parent.agent.accountcode}'`))
  if (channelMessenger.length) channelMessenger.map((item) => campaigns.push(`${item.name} (messenger)`));
  //sms
  let channelSms = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.sms_members WHERE agent = '${parent.agent.accountcode}'`))
  if (channelSms.length) channelSms.map((item) => campaigns.push(`${item.name} (sms)`));
  //Webchat
  let channelWeb = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.webchat_members WHERE agent = '${parent.agent.accountcode}'`))
  if (channelWeb.length) channelWeb.map((item) => campaigns.push(`${item.name} (webchat)`));

  //cargo los datos recogidos:
  $('#cmbCampaign').empty();
  $("#cmbCampaign").trigger("chosen:updated");
$('#cmbCampaign').prepend(`<option disabled selected value>${i18n.t('CRMLite.SelectCampaign')}</option>`);
  campaigns.map((item) => $('#cmbCampaign').append(new Option(item, item)));
  $("#cmbCampaign").trigger("chosen:updated");
}

//Carga tipificaciones:

document.getElementById('cmbCampaign').addEventListener('change', async () => {

  $('#cmbRes1').empty();
  $('#cmbRes2').empty();
  $('#cmbRes3').empty();
  document.getElementById('datediv').style.display = 'none';

  await completarD1();
});

async function completarD1() {
  let campana = document.getElementById('cmbCampaign').value.split(' ')[0];
  let can = document.getElementById('cmbCampaign').value.split(' ')[1];
  let canal = can.substring(1, can.length - 1);

  let resp = await UC_get_async(`SELECT distinct value1 FROM ccdata.dispositions WHERE campaign = '${campana}' AND channel = '${canal}'`, '');
  let respuesta = JSON.parse(resp);
  if (respuesta[0].value1.length > 0) {
    $('#cmbRes1').empty();
    $("#cmbRes1").trigger("chosen:updated");
    $('#cmbRes1').prepend(`<option disabled selected value>${i18n.t('CRMLite.dispo1')}</option>`);
    respuesta.map((item) => $('#cmbRes1').append(new Option(item.value1, item.value1)));
    $("#cmbRes1").trigger("chosen:updated");
  }
}

$('#cmbRes1').change(async () => {
  let campana = document.getElementById('cmbCampaign').value.split(' ')[0];
  let can = document.getElementById('cmbCampaign').value.split(' ')[1];
  let canal = can.substring(1, can.length - 1);

  let resp = await UC_get_async(`SELECT distinct value2 from ccdata.dispositions where 
    value1 = '${document.getElementById('cmbRes1').value}' and campaign = '${campana}' AND channel = '${canal}'`, '');
  $('#cmbRes2').empty();
  $('#cmbRes3').empty();
  let respuesta = JSON.parse(resp);
  if (respuesta[0].value2.length > 0) {
    hayMasTipificaciones = true;
    $("#cmbRes2").trigger("chosen:updated");
    $('#cmbRes2').prepend(`<option disabled selected value>${i18n.t('CRMLite.dispo2')}</option>`);
    respuesta.map((item) => $('#cmbRes2').append(new Option(item.value2, item.value2)));
    $("#cmbRes2").trigger("chosen:updated");
  } else {
    hayMasTipificaciones = false;
    consultarAccion();
  }
  $("#cmbRes2").trigger("chosen:updated");
  $("#cmbRes3").trigger("chosen:updated");
});

$('#cmbRes2').change(async () => {
  let campana = document.getElementById('cmbCampaign').value.split(' ')[0];
  let can = document.getElementById('cmbCampaign').value.split(' ')[1];
  let canal = can.substring(1, can.length - 1);

  let resp = await UC_get_async(`SELECT distinct value3 from ccdata.dispositions where 
        value1 = '${document.getElementById('cmbRes1').value}' and 
        value2 = '${document.getElementById('cmbRes2').value}' and 
        campaign = '${campana}' and channel = '${canal}'`, '');

  $('#cmbRes3').empty();
  let respuesta = JSON.parse(resp);
  if (respuesta[0].value3.length > 0) {
    hayMasTipificaciones = true;
    $("#cmbRes3").trigger("chosen:updated");
    $('#cmbRes3').prepend(`<option disabled selected value>${i18n.t('CRMLite.dispo3')}</option>`);
    respuesta.map((item) => $('#cmbRes3').append(new Option(item.value3, item.value3)));
    $("#cmbRes3").trigger("chosen:updated");
  } else {
    hayMasTipificaciones = false;
    consultarAccion();
  }

});

$('#cmbRes3').change(() => {
  consultarAccion();
  hayMasTipificaciones = false;
});


async function consultarAccion() {

  document.getElementById('datediv').style.display = 'none';

  let campana = document.getElementById('cmbCampaign').value.split(' ')[0];
  let can = document.getElementById('cmbCampaign').value.split(' ')[1];
  let canal = can.substring(1, can.length - 1);

  let res1 = document.getElementById('cmbRes1').value;
  let res2 = document.getElementById('cmbRes2').value;
  let res3 = document.getElementById('cmbRes3').value;
  let respi = await UC_get_async(`SELECT action from ccdata.dispositions where value1 = '${res1}' and value2 = '${res2}' and value3 = '${res3}' and campaign = '${campana}' and channel = '${canal}'`, '');
  let accion = JSON.parse(respi);

  if (res1.toUpperCase() === "RESCHEDULE" || res1.toUpperCase() === "REAGENDA" || res1.toUpperCase() === "RESPOOL") globalaction = "RESCHEDULE";
  if (res1.toUpperCase() === "BLACKLIST" || res1.toUpperCase() === "LISTA NEGRA" || res1.toUpperCase() === "DO NOT CALL" || res1.toUpperCase() === "NO LLAMAR MAS") globalaction = "BLACKLIST";
  if (accion.length && accion[0].action != "NOACTION") globalaction = accion[0].action.toUpperCase();

  if (globalaction == "RESCHEDULE") document.getElementById('datediv').style.display = 'block';

}

///

//Carga de datos del cliente si existe:
async function loadCustomer(callid, justAsking = false) { //phone or email

  let resp = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.OTCAuto_customers WHERE id_customer = ${callid} LIMIT 1`, ''));

  if (!resp.length) {
    resp = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.OTCAuto_customers WHERE phone = "${callid}" LIMIT 1`, ''));
  }

  if (!resp.length) {
    resp = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.OTCAuto_customers WHERE email = "${callid}" LIMIT 1`, ''));
  }

  if (!resp.length) {
    resp = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.OTCAuto_customers WHERE ID = "${callid}" LIMIT 1`, ''));
  }


  if (justAsking) {
    //retornamos el valor sin adjuntar los datos si solo esta preguntando.
    //Por defecto, los datos son cargados si no se lo aclara la variable justAsking.
    return resp.length ? resp[0] : [];
  }

  if (resp.length > 0) {
    fileArray = []; //vacio el array  para dejarle paso a los archivos del nuevo customer
    document.getElementById('txtID').value = resp[0].ID;
    document.getElementById('txtFullname').value = resp[0].fullname;
    document.getElementById('txtPhone').value = resp[0].phone;
    document.getElementById('txtEmail').value = resp[0].email;
    document.getElementById('txtSalesrep').value = resp[0].salesrep;
    document.getElementById('txtCustom1').value = resp[0].custom1;
    document.getElementById('txtCampaignid').value = resp[0].campaignid;
    document.getElementById('txtMake').value = resp[0].make;
    document.getElementById('txtModel').value = resp[0].model;
    document.getElementById('txtYear').value = resp[0].year;
    resp[0].files ? await loadFiles(resp[0].files) : null;
    customerFound = Number(resp[0].id_customer);
    notification(i18n.t('CRMLite.congrats'), i18n.t("CRMLite.customerLoaded"), 'fa fa-success', 'success');
    manualFormValidation();
    await loadHistoryTable(customerFound, config.historyLimit);
    return;
  } else {
    customerFound = '';
    return;
  }

}
//Se busca historial de gestiones para cargarlo sobre la tabla inferior:
async function loadHistoryTable(cid, limit = 5) {


  let tablita = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.OTCAuto_management WHERE id_customer = ${cid} ORDER BY date DESC LIMIT ${limit}`, ''));
  if (tablita.length) {

    document.getElementById("cntHistory").style.display = 'block';
    let documento = '';
    tablita.map((item) => {
      documento += `
        <tr>
            <td>${item.date}</td>
            <td>${item.agent}</td>
            <td>${item.queuename}</td>
            <td>${item.lvl1}</td>
            <td>${item.lvl2}</td>
            <td>${item.lvl3}</td>
            <td>${item.note}</td>
            <td>${item.channel}</td>    
            <td>${item.callid}</td>    
        </tr>
        `
    })
    document.getElementById('tblBodyHistory').innerHTML = documento;

  } else {

    document.getElementById("cntHistory").style.display = 'none';
    document.getElementById("tblBodyHistory").innerHTML = `
        <tr>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>    
            <td>-</td>    
        </tr>
        `;
  }
}

//Se añaden archivos cargados de la bbdd y los que vamos añadiendo en el correr de la interaccion
async function loadFiles(files) {

  let fileStr = "";
  let filesParse = files.split('|');

  filesParse.map((item) => {
    fileArray.push(item);//actualizo mi array con elementos nuevos
  });

  fileArray.map((item, pos) => {

    let reparse = item.split('>')
    fileStr += `<div class="badge-file badge-file-primary">
								<spam>
                  <i data-posicion="${pos}" class="closebadge fa fa-window-close"></i>
                  <a href="${reparse[1]}" target="_blank">${reparse[0]}</a>
								</spam>
							</div>`;
  });

  document.getElementById('filediv').innerHTML = fileStr;
  await updateBadges(); //actualizo los elementos 
}


//eliminar un archivo de tipo link y actualizacion de elementos pills
async function updateBadges() {

  let closebadge = document.querySelectorAll('.closebadge');

  for (let i = 0; i < closebadge.length; i++) {

    closebadge[i].addEventListener('click', (e) => {
      console.log(e);
      console.log(e.path[0].dataset.posicion); //de aqui sacaremos la posicion del mismo para eliminarlo del array

      swal({
        title: i18n.t("CRMLite.sure"),
        buttons: {
          cancel: true,
          confirm: "Ok"
        },
        closeOnClickOutside: false,
      }).then((res) => {
        let fileStr = "";
        if (res) {
          fileArray.splice(Number(e.path[0].dataset.posicion), 1)
          let i = 0;
          fileArray.map((item) => {
            let reparse = item.split('>')
            fileStr += `<div class="badge-file badge-file-primary">
								<spam>
                  <i id="closebadge" data-posicion="${i}" class="closebadge fa fa-window-close"></i>
                  <a href="${reparse[1]}" target="_blank">${reparse[0]}</a>
								</spam>
							</div>`;
            i++;
          });

          document.getElementById('filediv').innerHTML = fileStr;
          updateBadges()
        }
      });
    });
  }
}
