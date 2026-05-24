// =====================
// MÁSCARAS
// =====================
function aplicarMascara(id, mascara) {
  document.getElementById(id).addEventListener('input', function () {
    let valor = this.value.replace(/\D/g, '');
    let resultado = '';
    let i = 0;
    for (let j = 0; j < mascara.length && i < valor.length; j++) {
      if (mascara[j] === '0') {
        resultado += valor[i++];
      } else {
        resultado += mascara[j];
        if (mascara[j] === valor[i]) i++;
      }
    }
    this.value = resultado;
  });
}

aplicarMascara('inputCPF',      '000.000.000-00');
aplicarMascara('inputRG',       '00.000.000-0');
aplicarMascara('inputCEP',      '00000-000');
aplicarMascara('inputTelefone', '(00) 00000-0000');

// =====================
// TOGGLE NÃO INFORMADO
// =====================
function toggleNaoInformado(inputId, checkbox) {
  const campo = document.getElementById(inputId);
  if (checkbox.checked) {
    campo.setAttribute('data-naoinformado', 'true');
    campo.disabled = true;
    campo.value = '';
  } else {
    campo.removeAttribute('data-naoinformado');
    campo.disabled = false;
  }
}

// =====================
// LEITURA DO CAMPO
// =====================
function getValor(id) {
  const campo = document.getElementById(id);
  if (!campo) return null;
  if (campo.getAttribute('data-naoinformado') === 'true') return null;
  return campo.value.trim() || null;
}

// =====================
// BUSCA CEP
// =====================
// =====================
// BUSCA CEP
// =====================
async function buscarCEP(cep) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return;

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`);
    if (!response.ok) { alert('CEP não encontrado.'); return; }

    const data = await response.json();

    const endereco = document.getElementById('inputEndereco');
    const bairro   = document.getElementById('inputBairro');
    const cidade   = document.getElementById('inputCidade');
    const estado   = document.getElementById('inputEstado');

    if (endereco && !endereco.disabled) endereco.value = data.street       || '';
    if (bairro   && !bairro.disabled)   bairro.value   = data.neighborhood || '';
    if (cidade   && !cidade.disabled)   cidade.value   = data.city         || '';
    if (estado   && !estado.disabled)   estado.value   = data.state        || '';

    // trava os campos e checkboxes preenchidos pela API
    bloquearCamposCEP(true);

  } catch (error) {
    alert('Erro ao buscar CEP.');
  }
}

// =====================
// BLOQUEAR / LIBERAR CAMPOS DO CEP
// =====================
function bloquearCamposCEP(bloquear) {
  const camposCEP = ['inputBairro', 'inputCidade', 'inputEstado'];

  camposCEP.forEach(id => {
    const campo = document.getElementById(id);
    const check = document.getElementById('check' + id.replace('input', ''));

    if (bloquear) {
      if (campo) campo.disabled = true;
      if (check) {
        check.disabled = true;
        check.checked  = false;
        if (campo) campo.removeAttribute('data-naoinformado');
      }
    } else {
      if (campo) {
        campo.disabled = false;
        campo.value    = '';
        campo.removeAttribute('data-naoinformado');
      }
      if (check) {
        check.disabled = false;
        check.checked  = false;
      }
    }
  });
}

// =====================
// MONITOR DO CEP
// =====================
document.getElementById('inputCEP').addEventListener('input', function () {
  const cepLimpo = this.value.replace(/\D/g, '');

  if (cepLimpo.length === 8) {
    buscarCEP(this.value);
  } else {
    bloquearCamposCEP(false);
  }
});

// =====================
// LIMPAR CAMPOS
// =====================
function limparCampos() {
  const campos = [
    'inputNome', 'inputSobrenome', 'inputCPF', 'inputRG',
    'inputNascimento', 'inputTelefone', 'inputCEP', 'inputEndereco',
    'inputNumero', 'inputComplemento', 'inputBairro', 'inputCidade', 'inputEstado'
  ];

  campos.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.value = '';
      campo.disabled = false;
      campo.removeAttribute('data-naoinformado');
    }
    const check = document.getElementById('check' + id.replace('input', ''));
    if (check) check.checked = false;
  });
}

// =====================
// VALIDAÇÃO
// =====================
function validarCampos(dados) {
  if (dados.nome      === undefined) { alert('Preencha o Nome.');               return false; }
  if (dados.sobrenome === undefined) { alert('Preencha o Sobrenome.');          return false; }
  if (dados.cpf !== null && (!dados.cpf || dados.cpf.replace(/\D/g,'').length !== 11))
                                     { alert('CPF inválido.');                  return false; }
  if (dados.nascimento === undefined){ alert('Preencha a Data de Nascimento.');  return false; }
  if (dados.telefone !== null && dados.telefone && dados.telefone.replace(/\D/g,'').length < 10)
                                     { alert('Telefone inválido.');             return false; }
  if (dados.cep !== null && dados.cep && dados.cep.replace(/\D/g,'').length !== 8)
                                     { alert('CEP inválido.');                  return false; }
  if (dados.endereco === undefined)  { alert('Preencha o Endereço.');           return false; }
  if (dados.numero   === undefined)  { alert('Preencha o Número.');             return false; }

  return true;
}

// =====================
// BANCO TEMPORÁRIO
// =====================
const listaCadastros = [];

// =====================
// ENVIAR
// =====================
// variável para guardar os dados entre os modais
let dadosPendentes = null;

// =====================
// ENVIAR — agora só valida e abre confirmação
// =====================
async function confirmarDados() {
  const dados = {
    nome:        getValor('inputNome'),
    sobrenome:   getValor('inputSobrenome'),
    cpf:         getValor('inputCPF'),
    rg:          getValor('inputRG'),
    nascimento:  getValor('inputNascimento'),
    telefone:    getValor('inputTelefone'),
    cep:         getValor('inputCEP'),
    endereco:    getValor('inputEndereco'),
    numero:      getValor('inputNumero'),
    complemento: getValor('inputComplemento'),
    bairro:      getValor('inputBairro'),
    cidade:      getValor('inputCidade'),
    estado:      getValor('inputEstado'),
  };

  if (!validarCampos(dados)) return;

  const exibir = (valor) => valor ?? 'Não informado';

  document.getElementById('confirmacaoDados').innerHTML = `
    <hr>
    <p><strong>Nome:</strong> ${exibir(dados.nome)} ${exibir(dados.sobrenome)}</p>
    <p><strong>CPF:</strong> ${exibir(dados.cpf)}</p>
    <p><strong>RG:</strong> ${exibir(dados.rg)}</p>
    <p><strong>Nascimento:</strong> ${exibir(dados.nascimento)}</p>
    <p><strong>Telefone:</strong> ${exibir(dados.telefone)}</p>
    <hr>
    <p><strong>CEP:</strong> ${exibir(dados.cep)}</p>
    <p><strong>Endereço:</strong> ${exibir(dados.endereco)}, ${exibir(dados.numero)}</p>
    <p><strong>Bairro:</strong> ${exibir(dados.bairro)}</p>
    <p><strong>Cidade:</strong> ${exibir(dados.cidade)} - ${exibir(dados.estado)}</p>
    <p><strong>Complemento:</strong> ${exibir(dados.complemento)}</p>
    <hr>
  `;

  dadosPendentes = dados;
  $('#popupConfirmacao').modal('show');
}

// =====================
// SALVAR — chamado ao clicar "Sim, cadastrar"
// =====================
async function salvarDados() {
  $('#popupConfirmacao').modal('hide');

  try {
    listaCadastros.push(dadosPendentes);
    console.log('Lista atual:', listaCadastros);
    mostrarPopup('sucesso', dadosPendentes);
    dadosPendentes = null;
    limparCampos();
  } catch (error) {
    mostrarPopup('erro', null, error.message);
  }
}
// =====================
// POPUP
// =====================
function mostrarPopup(tipo, dados, erroMsg) {
  const icone    = document.getElementById('popupIcone');
  const titulo   = document.getElementById('popupTitulo');
  const mensagem = document.getElementById('popupMensagem');

  const exibir = (valor) => valor ?? 'Não informado';

  if (tipo === 'sucesso') {
    icone.className = 'fas fa-check-circle fa-3x text-success mb-3';
    titulo.textContent = 'Cadastro realizado com sucesso!';
    mensagem.innerHTML = `
      <hr>
      <div style="text-align: left; font-size: 13px;">
        <p><strong>Nome:</strong> ${exibir(dados.nome)} ${exibir(dados.sobrenome)}</p>
        <p><strong>CPF:</strong> ${exibir(dados.cpf)}</p>
        <p><strong>RG:</strong> ${exibir(dados.rg)}</p>
        <p><strong>Nascimento:</strong> ${exibir(dados.nascimento)}</p>
        <p><strong>Telefone:</strong> ${exibir(dados.telefone)}</p>
        <hr>
        <p><strong>CEP:</strong> ${exibir(dados.cep)}</p>
        <p><strong>Endereço:</strong> ${exibir(dados.endereco)}, ${exibir(dados.numero)}</p>
        <p><strong>Bairro:</strong> ${exibir(dados.bairro)}</p>
        <p><strong>Cidade:</strong> ${exibir(dados.cidade)} - ${exibir(dados.estado)}</p>
        <p><strong>Complemento:</strong> ${exibir(dados.complemento)}</p>
      </div>
    `;
  } else {
    icone.className = 'fas fa-times-circle fa-3x text-danger mb-3';
    titulo.textContent = 'Algo não saiu bem.';
    mensagem.innerHTML = `
      <p class="text-muted">Tente mais tarde.</p>
      ${erroMsg ? `<p style="font-size:12px;color:red;"><strong>Detalhe:</strong> ${erroMsg}</p>` : ''}
    `;
  }

  $('#popupFeedback').modal('show');
}