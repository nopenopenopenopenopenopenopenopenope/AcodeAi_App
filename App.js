import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Image,
  Alert,
  Platform
} from 'react-native';
import {
  SafeAreaView,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
    logoutUsuario,
  userImg,
  fetchPacientes,
  criarPaciente,
  atualizarPaciente,
  salvarPeso,
  registrarBatimento,
  registrarCheckIn,
  conectarPaciente,
  saveListItem,
  setTarefaConcluida,
  salvarMetasDieta,
  registrarAgua,
  registrarRefeicao,
  desconectarPaciente,
  removerPaciente,
  desconectarEstoque,
  removerEstoque,
  removerRelatorio,
  removerMedicamento,
  salvarRestricoesDieta,
  fetchEstoques,
  saveProduto,
  criarEstoque,
  conectarEstoque,
  atualizarUsuario,
  apagarUsuario,
  removerConexaoPaciente,
  buscarConexoesPaciente
} from './components/storageFuncs';
import Splash from './Routes/splashScreen';
import AppCycle from './Routes/appCycle';
import LoginCycle from './Routes/loginCycle';
import { navigationRef } from './components/navigationRef';
import CheckInF from './forms/checkInForm';
import LaudoF from './forms/laudoForm';
import EditStockF from './forms/editStockForm';
import MedicineF from './forms/medicineForm';
import PacientF from './forms/pacientForm';
import ReportF from './forms/reportForm';
import StockF from './forms/stockForm';
import TaskF from './forms/taskForm';
import profiler from './forms/profiler';
import ConnectStockF from './forms/connectStockForm';
import ConnectPacientF from './forms/connectPacientForm';
import WeightF from './forms/weightForm';
import HeartRateF from './forms/heartRateForm';
import DietF from './forms/dietForm';
import { useState, useRef } from 'react';
import TopMenu from './components/topMenu';
import BottomMenu from './components/bottomMenu';
import { StatusBar } from 'expo-status-bar';

const PACIENTS_LIMIT = 3;

const emptyProfile = {
  id: null,
  pacientIds: [],
  pacientsLimit: PACIENTS_LIMIT,
  selectedPacient: null,
  stockId: null,
  name: '',
  role: 'Cuidador',
  email: '',
  phone: '',
  foto: userImg,
};

export default function App() {
  const prototypeHeight = Dimensions.get('window').height;
  const prototypeWidth = Dimensions.get('window').width;
  const [form, setForm] = useState('');
  const [formData, setFormData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [splashscreen, setSplashscreen] = useState(true);
  const [profile, setProfile] = useState(emptyProfile);
  const [pacient, setPacient] = useState([]);
  const [stock, setStock] = useState([]);

  const op = useRef(new Animated.Value(0)).current;
  
  const loadPacientes = async (userId, preferId = null) => {
    const list = await fetchPacientes(userId);
    if (!list) return;
    setPacient(list);
    setProfile((prev) => {
      const keep = list.some((p) => p.id === prev.selectedPacient)
        ? prev.selectedPacient
        : null;
      return {
        ...prev,
        pacientIds: list.map((p) => p.id),
        selectedPacient: preferId ?? keep ?? list[0]?.id ?? null,
      };
    });
  };

  const loadEstoques = async (userId) => {
    const list = await fetchEstoques(userId);
    if (!list) return;
    setStock(list);
    setProfile((prev) => ({ ...prev, stockId: list[0]?.id ?? null }));
  };

  const handleAuthenticated = async (usuario) => {
    if (!usuario?.id) return;
    setProfile({
      ...emptyProfile,
      id: usuario.id,
      name: usuario.name ?? '',
      email: usuario.email ?? '',
      phone: usuario.phone ?? '',
      foto: usuario.foto ?? userImg,
    });
    setPacient([]);
    setStock([]);
    setIsLoggedIn(true);
    await Promise.all([loadPacientes(usuario.id), loadEstoques(usuario.id)]);
  };

  const handleLogout = async () => {
    try {
      await logoutUsuario();
    } catch (error) {
      console.error('Erro ao encerrar sessão', error);
    }
    setIsLoggedIn(false);
    setProfile(emptyProfile);
    setPacient([]);
    setStock([]);
  };
  
  const openForm = (formName, data = null) => {
    if (formName === 'createStock') {
      guarded(createStock)();
      return;
    }

    setForm(formName);
    setFormData(data);

    Animated.timing(op, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };
  const closeForm = () => {
    setForm('');
    setFormData(null);

    Animated.timing(op, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const saving = useRef(false);
  const guarded =
    (fn) =>
    async (...args) => {
      if (saving.current) return;
      saving.current = true;
      try {
        return await fn(...args);
      } finally {
        saving.current = false;
      }
    };

  const todayBR = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const requireSelectedPacient = () => {
    if (!profile.selectedPacient) {
      Alert.alert('Atenção', 'Nenhum paciente selecionado');
      return null;
    }
    return profile.selectedPacient;
  };

  const updateStockQuantity = guarded(async (product, newQuantity) => {
  if (!profile.stockId) return;

  const saved = await saveProduto(
    profile.stockId,
    {
      name: product.name,
      quantity: String(newQuantity),
      lastAcquisition: product.lastAcquisition,
      foto: product.foto,
    },
    product.id
  );
  if (!saved) return;

  setStock((prev) =>
    prev.map((s) => {
      if (s.id !== profile.stockId) return s;
      return {
        ...s,
        products: (s.products ?? []).map((p) => (p.id === saved.id ? saved : p)),
      };
    })
  );
});
  
  const upsertPacientListItem = async (field, entry) => {
    const pacienteId = requireSelectedPacient();
    if (!pacienteId) return;

    const saved = await saveListItem(field, pacienteId, entry, formData?.id ?? null);
    if (!saved) return;

    setPacient((prev) =>
      prev.map((p) => {
        if (p.id !== pacienteId) return p;
        const list = p[field] ?? [];
        const exists = list.some((item) => item.id === saved.id);
        return {
          ...p,
          [field]: exists
            ? list.map((item) => (item.id === saved.id ? saved : item))
            : [...list, saved],
        };
      })
    );
    closeForm();
  };
  const updateSelectedPacient = (patch) => {
    setPacient((prev) =>
      prev.map((p) =>
        p.id === profile.selectedPacient ? { ...p, ...patch } : p
      )
    );
    closeForm();
  };

  const saveTask = (output) =>
    upsertPacientListItem('schedule', {
      name: output.name,
      desc: output.desc,
      time:
        output.time ||
        new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
      date: output.date,
      completed: formData?.completed ?? false,
      type: 'event',
      professional: output.professional,
      place: output.place,
      address: output.address,
    });

  const saveReport = (output) =>
    upsertPacientListItem('reports', {
      title: output.title,
      date: output.date || todayBR(),
      body: output.body,
      notes: output.notes,
    });

  const saveCheckin = async (output) => {
  const pacienteId = requireSelectedPacient();
  if (!pacienteId) return;
  const saved = await registrarCheckIn(pacienteId, output, formData?.id ?? null);
  if (!saved) return;
  await loadPacientes(profile.id);
  closeForm();
};

  const saveLaudo = (output) =>
    upsertPacientListItem('laudos', {
      name: output.name,
      date: output.date ,
      doctor: output.doctor,
      file: output.file,
      fileType: output.fileType,
    });

  const saveMedicine = (output) =>
    upsertPacientListItem('medicines', {
      name: output.name,
      start: output.start || todayBR(),
      treatment: output.treatment,
      frequency: output.frequency,
      foto: output.foto,
    });

  const toggleTask = async (taskId) => {
    const pacienteId = profile.selectedPacient;
    const task = pacient
      .find((p) => p.id === pacienteId)
      ?.schedule?.find((t) => t.id === taskId);
    if (!task) return;

    const concluida = !task.completed;
    const ok = await setTarefaConcluida(taskId, concluida);
    if (!ok) return;

    setPacient((prev) =>
      prev.map((p) =>
        p.id !== pacienteId
          ? p
          : {
              ...p,
              schedule: p.schedule.map((t) =>
                t.id === taskId ? { ...t, completed: concluida } : t
              ),
            }
      )
    );
  };

  const removePacientConnection = async (pacienteId, targetUserId) => {
  const targetPacienteId = pacienteId ?? requireSelectedPacient();
  if (!targetPacienteId || !targetUserId) return;

  if (targetUserId === profile.id) {
    Alert.alert(
      'Atenção',
      'Para sair deste paciente, use a opção de desconectar.'
    );
    return;
  }

  const ok = await confirmar(
    'Remover conexão',
    `Remover o acesso deste usuário a ${nomeDoPaciente(targetPacienteId)}?`,
    'Remover'
  );
  if (!ok) return;

  await guarded(async () => {
    const removido = await removerConexaoPaciente(targetPacienteId, targetUserId);
    if (!removido) return;
    await loadPacientes(profile.id);
  })();
};

  const removeReport = async (id) => {
    const pacienteId = requireSelectedPacient();
    if (!pacienteId) return;

    const ok = await confirmar(
      'Remover relatório',
      'Tem certeza que deseja apagar este relatório? Essa ação não pode ser desfeita.',
      'Remover'
    );
    if (!ok) return;
    const sucesso = await removerRelatorio(id);
    if (!sucesso) return;
    setPacient((prev) =>
      prev.map((p) =>
        p.id !== pacienteId
          ? p
          : { ...p, reports: (p.reports ?? []).filter((r) => r.id !== id) }
      )
    );
  };

  const saveStockProduct = async (output) => {
    if (!profile.stockId) {
      Alert.alert('Atenção', 'Conecte-se a um estoque primeiro.');
      return;
    }

    const itemsList = Array.isArray(output.items) ? output.items : [];

    let successCount = 0;

    for (const item of itemsList) {
      if (!item.name || !String(item.name).trim()) continue;

      const saved = await saveProduto(
        profile.stockId,
        {
          name: item.name,
          quantity: item.quantity || '0',
          lastAcquisition: output.lastAcquisition || todayBR(),
          foto: output.foto || null,
        },
        null 
      );

      if (saved) successCount++;
    }

    if (successCount > 0) {
      await loadEstoques(profile.id);
      closeForm();
    } else {
      Alert.alert('Atenção', 'Preencha o nome de pelo menos um produto para salvar.');
    }
  };
  
  const createStock = async () => {
    const id = await criarEstoque();
    if (!id) return;
    await loadEstoques(profile.id);
    closeForm();
  };
  
  const connectToStock = async (output) => {
    const code = String(output?.stockId ?? '').trim();
    if (!code) return { success: false, error: 'Informe o código do estoque' };

    const result = await conectarEstoque(code);
    if (!result.success) return result;

    await loadEstoques(profile.id);
    return { success: true };
  };

  const connectToPacient = async (output) => {
    const code = String(output?.pacientId ?? '').trim();
    if (!code) return { success: false, error: 'Informe o código do paciente' };

    const pacientIds = profile.pacientIds ?? [];
    if (pacientIds.includes(code.toUpperCase())) {
      return { success: false, error: 'Você já está conectado a este paciente' };
    }
    if (pacientIds.length >= (profile.pacientsLimit ?? Infinity)) {
      return { success: false, error: 'Limite de pacientes atingido' };
    }

    const result = await conectarPaciente(code);
    if (!result.success) return result;

    await loadPacientes(profile.id);
    return { success: true };
  };

  const savePacient = async (output) => {
    if (!output?.name?.trim()) {
      Alert.alert('Atenção', 'Informe o nome do paciente.');
      return;
    }

    if (formData?.id) {
      const ok = await atualizarPaciente(formData.id, output);
      if (!ok) return;
      await loadPacientes(profile.id);
    } else {
      if ((profile.pacientIds ?? []).length >= (profile.pacientsLimit ?? Infinity)) {
        Alert.alert('Atenção', 'Limite de pacientes atingido');
        return;
      }
      const novoId = await criarPaciente(output);
      if (!novoId) return;
      await loadPacientes(profile.id, profile.selectedPacient ?? novoId); 
    }
    closeForm();
  };

  const saveWeight = async (output) => {
    const pacienteId = requireSelectedPacient();
    if (!pacienteId) return;
    const weight = await salvarPeso(pacienteId, output.weight);
    if (!weight) return;
    updateSelectedPacient({ weight });
  };

  const saveHeartRate = async (output) => {
    const bpm = Number(output.current);
    if (!Number.isFinite(bpm) || bpm <= 0) {
      Alert.alert('Atenção', 'Informe um valor de batimentos válido.');
      return;
    }
    const pacienteId = requireSelectedPacient();
    if (!pacienteId) return;

    const reading = await registrarBatimento(pacienteId, bpm);
    if (!reading) return;

    setPacient((prev) =>
      prev.map((p) =>
        p.id !== pacienteId
          ? p
          : {
              ...p,
              heartRate: {
                current: reading.bpm,
                history: [...(p.heartRate?.history ?? []), reading],
              },
            }
      )
    );
    closeForm();
  };
  const saveProfile = async (output) => {
  if (!output?.name?.trim()) {
    Alert.alert('Atenção', 'Informe seu nome.');
    return;
  }

  const usuarioAtualizado = await atualizarUsuario({
    name: output.name.trim(),
    foto: output.foto,
  });

  if (!usuarioAtualizado) return;

  setProfile((prev) => ({
    ...prev,
    name: usuarioAtualizado.name,
    foto: usuarioAtualizado.foto,
  }));

  closeForm();
};

  const saveDiet = async (output) => {
    const pacienteId = requireSelectedPacient();
    if (!pacienteId) return;

    const filled = (value) => String(value ?? '').trim() !== '';
    let ok = null;

    if (output.section === 'goals') {
      ok = await salvarMetasDieta(pacienteId, {
        calories: output.calories,
        carbs: output.carbs,
        protein: output.protein,
        lipids: output.lipids,
      });
    } else if (output.section === 'water') {
      ok = true;
      if (filled(output.water)) {
        ok = await salvarMetasDieta(pacienteId, { water: output.water });
      }
      if (ok && filled(output.waterAdd)) {
        ok = await registrarAgua(pacienteId, output.waterAdd);
      }
    } else if (output.section === 'meal') {
      ok = await registrarRefeicao(pacienteId, {
        calories: output.calories,
        carbs: output.carbs,
        protein: output.protein,
        lipids: output.lipids,
      });
    } else if (output.section === 'restrictions') {
      ok = await salvarRestricoesDieta(pacienteId, {
        allergies: output.allergies,
        intolerances: output.intolerances,
      });
    }

    if (!ok) return;
    await loadPacientes(profile.id);
    closeForm();
  };
  
  const confirmar = (titulo, mensagem, textoOk) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
    }
    return new Promise((resolve) => {
      Alert.alert(
        titulo,
        mensagem,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: textoOk, style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });
  };

  const deleteUser = async (id) => {
    console.log('test')
    const ok = await confirmar(
      'Apagar conta',
      `Você está prestes a apagar a sua conta, essa ação é IRREVERSIVEL. \nVocê tem certeza que quer continuar?`,
      'apagar conta'
    );
    if (!ok) return;
    
    await guarded(async () => {
      if (!(await apagarUsuario(id))) return;
      await loadPacientes(profile.id);
    })();
    setIsLoggedIn(false);
    setProfile(emptyProfile);
    setPacient([]);
    setStock([]);
  }

  const nomeDoPaciente = (id) => pacient.find((p) => p.id === id)?.name ?? 'este paciente';

  const disconnectPacient = async (id) => {
    const ok = await confirmar(
      'Desconectar paciente',
      `Você deixará de ter acesso a ${nomeDoPaciente(id)}. Os dados continuam salvos e você pode reconectar pelo id dele no app, caso anote antes.`,
      'Desconectar'
    );
    if (!ok) return;
    await guarded(async () => {
      if (!(await desconectarPaciente(id))) return;
      await loadPacientes(profile.id);
    })();
  };

  const removePacient = async (id) => {
    const ok = await confirmar(
      'Remover paciente',
      `Isso apaga ${nomeDoPaciente(id)} e todos os dados (medicamentos, laudos, agenda, dieta...). Não dá para desfazer.`,
      'Remover'
    );
    if (!ok) return;
    await guarded(async () => {
      if (!(await removerPaciente(id))) return;
      await loadPacientes(profile.id);
    })();
  };

  const disconnectStock = async () => {
    const ok = await confirmar(
      'Desconectar do estoque',
      'Você deixará de ter acesso a este estoque. Ele continua existindo para os outros usuários e você pode reconectar pelo código, caso anote antes.',
      'Desconectar'
    );
    if (!ok) return;
    await guarded(async () => {
      if (!(await desconectarEstoque())) return;
      await loadEstoques(profile.id);
    })();
  };

  const removeStock = async () => {
    const ok = await confirmar(
      'Remover estoque',
      'Isso apaga o estoque e todos os produtos. Não dá para desfazer.',
      'Remover'
    );
    if (!ok) return;
    await guarded(async () => {
      if (!(await removerEstoque())) return;
      await loadEstoques(profile.id);
    })();
  };

  const removeMedicine = async (id) => {
    const pacienteId = requireSelectedPacient();
    if (!pacienteId) return;
    const nome = pacient
      .find((p) => p.id === pacienteId)
      ?.medicines?.find((m) => m.id === id)?.name;
    const ok = await confirmar(
      'Remover medicamento',
      `Remover ${nome ?? 'este medicamento'} da lista? Não dá para desfazer.`,
      'Remover'
    );
    if (!ok) return;
    await guarded(async () => {
      if (!(await removerMedicamento(id))) return;
      setPacient((prev) =>
        prev.map((p) =>
          p.id !== pacienteId
            ? p
            : { ...p, medicines: (p.medicines ?? []).filter((m) => m.id !== id) }
        )
      );
    })();
  };

  const forms = {
    check: { component: CheckInF, output: guarded(saveCheckin) },
    laudo: { component: LaudoF, output: guarded(saveLaudo) },
    medicine: { component: MedicineF, output: guarded(saveMedicine) },
    pacient: { component: PacientF, output: guarded(savePacient) },
    stock: { component: StockF, output: guarded(saveStockProduct) },
    editStock: { component: EditStockF, output: guarded(saveStockProduct) },
    task: { component: TaskF, output: guarded(saveTask) },
    report: { component: ReportF, output: guarded(saveReport) },
    connectStock: { component: ConnectStockF, output: connectToStock },
    connectPacient: { component: ConnectPacientF, output: connectToPacient },
    weight: { component: WeightF, output: guarded(saveWeight) },
    heartRate: { component: HeartRateF, output: guarded(saveHeartRate) },
    diet: { component: DietF, output: guarded(saveDiet) },
    profile: {
  component: profiler,
  output: guarded(saveProfile),
},
  };

  const onSelectPacient = (id) => {
    setProfile((prev) => ({ ...prev, selectedPacient: id }));
  };

  const ActiveForm = forms[form];

  return (
     <SafeAreaProvider>
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['top', 'bottom', 'left', 'right']}
    >
    <StatusBar hidden={true} />
    <NavigationContainer ref={navigationRef}>
      <View style={{ flex: 1 }}>
        {isLoggedIn ? (
          <>
            <AppCycle
              openForm={openForm}
              onDeleteReport={removeReport}
              onRemovePacientConnection={removePacientConnection}
              profilestuff={profile}
              pacientstuff={pacient}
              stockstuff={stock}
              onSelectPacient={onSelectPacient}
              onDisconnectPacient={disconnectPacient}
              onRemovePacient={removePacient}
              onDisconnectStock={disconnectStock}
              onRemoveStock={removeStock}
              onRemoveMedicine={removeMedicine}
              onToggleTask={toggleTask}
              onDeleteUser={deleteUser}
              onUpdateStockQuantity={updateStockQuantity}
            />
            {ActiveForm && (
              <ActiveForm.component
                style={{
                  opacity: op.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                }}
                closeForm={closeForm}
                useOutput={ActiveForm.output}
                initialData={formData}
              />
            )}
            {(
              <>
                <TopMenu
                  prototypeHeight={prototypeHeight}
                  prototypeWidth={prototypeWidth}
                  userImg={profile.foto}
                  onLogout={handleLogout}
                />
                <BottomMenu
                  prototypeHeight={prototypeHeight}
                  prototypeWidth={prototypeWidth}
                />
              </>
            )}
          </>
        ) : (
          <LoginCycle onAuthenticated={handleAuthenticated} />
        )}
        {splashscreen && (
          <>
            <Splash
              state={splashscreen}
              handler={setSplashscreen}
              onAuthenticated={handleAuthenticated}
            />
          </>
        )}
      </View>
    </NavigationContainer>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
});
