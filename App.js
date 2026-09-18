import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  clearStoredUser,
  userImg,
  initialProfile,
  initialPacients,
  initialStock,
  registrarPaciente,
} from './components/storageFuncs';
import Splash from './Routes/splashScreen';
import AppCycle from './Routes/appCycle';
import LoginCycle from './Routes/loginCycle';
import { navigationRef } from './components/navigationRef';
import CheckInF from './forms/checkInForm';
import LaudoF from './forms/laudoForm';
import MedicineF from './forms/medicineForm';
import PacientF from './forms/pacientForm';
import ReportF from './forms/reportForm';
import StockF from './forms/stockForm';
import TaskF from './forms/taskForm';
import CreateStockF from './forms/createStockForm';
import ConnectStockF from './forms/connectStockForm';
import ConnectPacientF from './forms/connectPacientForm';
import WeightF from './forms/weightForm';
import HeartRateF from './forms/heartRateForm';
import { useState, useRef } from 'react';
import TopMenu from './components/topMenu';
import BottomMenu from './components/bottomMenu';

/*
  o que fazer:
  Concluir a splashscreen
  Mover o verificador inicial de auth para a splashscreen

 */
export default function App() {
  const prototypeHeight = Dimensions.get('window').height;
  const prototypeWidth = Dimensions.get('window').width;
  const [form, setForm] = useState('');
  const [formData, setFormData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handler para a splashscreen (Em Progresso)
  const [splashscreen, setSplashscreen] = useState(true);

  // Usa os dados reais do usuário autenticado (id/nome/email/telefone —
  // vindos do cadastro, que agora gera um id de verdade) em vez de
  // ignorá-los. Todo usuário começa sem pacientes e sem estoque — quem
  // quiser os dados de demonstração (pacientes/estoque do mock) pode
  // criar seus próprios pacientes pelo formulário, ou entrar no estoque
  // de demonstração digitando o id 'estoque1' em "Conectar a um estoque
  // existente".
  const handleAuthenticated = (usuario) => {
    setProfile((prev) => ({
      ...prev,
      id: usuario?.id ?? prev.id,
      name: usuario?.name ?? prev.name,
      email: usuario?.email ?? prev.email,
      phone: usuario?.phone ?? prev.phone,
      pacientIds: [],
      selectedPacient: null,
      stockId: null,
    }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearStoredUser().catch((error) =>
      console.error('Erro ao remover usuário', error)
    );
    setIsLoggedIn(false);
  };

  const [profile, setProfile] = useState(initialProfile);

  const [pacient, setPacient] = useState(initialPacients);

  // Estoque: um usuário só pode ter um estoque (profile.stockId), mas um
  // estoque pode ter vários usuários (stock.userIds).
  const [stock, setStock] = useState(initialStock);

  const op = useRef(new Animated.Value(0)).current;

  // `data` is optional: pass the existing object being edited (e.g. a
  // specific medicine, a stock product) so the form opens pre-filled;
  // omit it (or pass null) to open the form blank, for adding something new.
  const openForm = (form, data = null) => {
    setForm(form);
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

  // Declaradas antes de `forms` abaixo, já que `forms` as referencia —
  // `const` depois de `forms` daria erro (temporal dead zone).

  const generateId = (prefix) =>
    `${prefix}_${Date.now().toString(36)}_${Math.floor(
      Math.random() * 1e4
    ).toString(36)}`;

  const todayBR = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const emptyDiet = () => ({
    calories: { current: 0, goal: 0 },
    macros: {
      carbs: { current: 0, goal: 0 },
      protein: { current: 0, goal: 0 },
      lipids: { current: 0, goal: 0 },
    },
    water: { current: 0, goal: 0 },
    restrictions: { allergies: [], intolerances: [] },
  });

  // Adiciona `entry` a `pacient[selectedPacient][field]`, ou — se `entry.id`
  // já existe na lista — substitui o item existente por ele (edição).
  // `formData` (o initialData passado a openForm) é quem carrega o id
  // quando estamos editando um item já existente.
  const upsertPacientListItem = (field, entry, idPrefix) => {
    const id = formData?.id ?? entry.id ?? generateId(idPrefix);
    const finalEntry = { ...entry, id };

    setPacient((prev) =>
      prev.map((p) => {
        if (p.id !== profile.selectedPacient) return p;
        const list = p[field] ?? [];
        const exists = list.some((item) => item.id === id);
        return {
          ...p,
          [field]: exists
            ? list.map((item) => (item.id === id ? finalEntry : item))
            : [...list, finalEntry],
        };
      })
    );
    closeForm();
  };

  // Pra campos que não são listas (weight, heartRate, ...) — só mescla
  // `patch` no paciente selecionado, em vez de empurrar/editar um item
  // dentro de uma lista como upsertPacientListItem faz.
  const updateSelectedPacient = (patch) => {
    setPacient((prev) =>
      prev.map((p) =>
        p.id === profile.selectedPacient ? { ...p, ...patch } : p
      )
    );
    closeForm();
  };

  const saveTask = (output) => {
    upsertPacientListItem(
      'schedule',
      {
        name: output.name,
        desc: output.desc,
        time: output.time || 'WIP',
        date: formData?.date ?? todayBR(),
        completed: formData?.completed ?? false,
        type: formData?.type ?? 'task',
      },
      'task'
    );
  };

  const saveReport = (output) => {
    upsertPacientListItem(
      'reports',
      {
        title: output.title,
        date: output.date || todayBR(),
        body: output.body,
        notes: output.notes,
      },
      'report'
    );
  };

  const saveCheckin = (output) => {
    upsertPacientListItem(
      'checkins',
      {
        feeling: output.feeling,
        sleep: output.sleep,
        moodChange: output.moodChange,
        notes: output.notes,
        date: output.date || todayBR(),
      },
      'checkin'
    );
  };

  const saveLaudo = (output) => {
    upsertPacientListItem(
      'laudos',
      {
        name: output.name,
        date: output.date || todayBR(),
        doctor: output.doctor,
        file: output.file,
      },
      'laudo'
    );
  };

  const saveMedicine = (output) => {
    upsertPacientListItem(
      'medicines',
      {
        name: output.name,
        start: output.start || todayBR(),
        treatment: output.treatment,
        frequency: output.frequency,
        foto: output.foto || null,
      },
      'medicine'
    );
  };
  // Estoque: um usuário só tem um estoque (profile.stockId), então o
  // produto sempre é adicionado/editado dentro desse estoque.
  const saveStockProduct = (output) => {
    const id = formData?.id ?? generateId('product');
    const finalEntry = {
      name: output.name,
      quantity: output.quantity,
      lastAcquisition: output.lastAcquisition || todayBR(),
      items: output.items ?? [],
      foto: output.foto || null,
      id,
    };

    setStock((prev) =>
      prev.map((s) => {
        if (s.id !== profile.stockId) return s;
        const list = s.products ?? [];
        const exists = list.some((p) => p.id === id);
        return {
          ...s,
          products: exists
            ? list.map((p) => (p.id === id ? finalEntry : p))
            : [...list, finalEntry],
        };
      })
    );
    closeForm();
  };

  // Cria um estoque novo, vazio, e já conecta o usuário atual a ele.
  // Diferente de connectToStock, esta sempre funciona — então segue o
  // mesmo padrão dos outros forms e fecha sozinha.
  const createStock = (output) => {
    const id = generateId('estoque');
    const newStock = {
      id,
      name: output?.name || '',
      userIds: profile.id ? [profile.id] : [],
      products: [],
    };
    setStock((prev) => [...prev, newStock]);
    setProfile((prev) => ({ ...prev, stockId: id }));
    closeForm();
  };

  // Conecta o usuário atual a um estoque já existente, pelo id dele —
  // o equivalente, por enquanto, a um "código de convite". Um estoque
  // pode ter vários usuários, então isso só adiciona o usuário atual à
  // lista de usuários do estoque, sem tirar ninguém.
  // Diferente dos outros `output`, este NÃO fecha o form sozinho — quem
  // chama (ConnectStockF) decide, com base no { success, error }
  // retornado, se fecha (sucesso) ou mostra o erro e continua aberto.
  const connectToStock = (output) => {
    const trimmed = String(output?.stockId ?? '').trim();
    if (!trimmed)
      return { success: false, error: 'Informe o código do estoque' };

    const exists = stock.some((s) => s.id === trimmed);
    if (!exists) return { success: false, error: 'Estoque não encontrado' };

    setStock((prev) =>
      prev.map((s) => {
        if (s.id !== trimmed) return s;
        if (!profile.id || (s.userIds ?? []).includes(profile.id)) return s;
        return { ...s, userIds: [...(s.userIds ?? []), profile.id] };
      })
    );
    setProfile((prev) => ({ ...prev, stockId: trimmed }));
    return { success: true };
  };

  // Conecta o usuário atual a um paciente já existente, pelo id dele —
  // não precisa mexer no paciente em si (ao contrário do estoque, ele
  // não guarda uma lista de usuários conectados): basta acrescentar o id
  // em profile.pacientIds, respeitando o mesmo limite (pacientsLimit) e
  // a mesma regra de "não duplicar" usados por savePacient/handleAddPacient.
  // Assim como connectToStock, NÃO fecha o form sozinho.
  const connectToPacient = (output) => {
    const trimmed = String(output?.pacientId ?? '').trim();
    if (!trimmed)
      return { success: false, error: 'Informe o código do paciente' };

    const exists = pacient.some((p) => p.id === trimmed);
    if (!exists) return { success: false, error: 'Paciente não encontrado' };

    const pacientIds = profile.pacientIds ?? [];
    if (pacientIds.includes(trimmed)) {
      return {
        success: false,
        error: 'Você já está conectado a este paciente',
      };
    }

    const limit = profile.pacientsLimit ?? Infinity;
    if (pacientIds.length >= limit) {
      return { success: false, error: 'Limite de pacientes atingido' };
    }

    setProfile((prev) => ({
      ...prev,
      pacientIds: [...(prev.pacientIds ?? []), trimmed],
      selectedPacient: prev.selectedPacient ?? trimmed,
    }));
    return { success: true };
  };

  // PacientF só coleta uma única lista de "restrições alimentares" (não
  // separa alergia de intolerância), então ao salvar ela substitui as
  // alergias e preserva as intolerâncias como estavam.
  const savePacient = async (output) => {
      console.log('1 - savePacient recebeu:', output);
    const resultado = await registrarPaciente({
      name: output.name,
      doencas: output.conditions,
      restrictions: output.restrictions,
      birthDate: output.age,
    })
      console.log('2 - resultado do Supabase:', resultado);
    if (!resultado){
      return
    }
      console.log('4 - Cadastro aprovado, atualizando estado');


    const conditions = output.conditions
      ? output.conditions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const restrictions = output.restrictions
      ? output.restrictions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (formData?.id) {
      setPacient((prev) =>
        prev.map((p) =>
          p.id === formData.id
            ? {
                ...p,
                name: output.name || p.name,
                birthDate: output.age || p.birthDate,
                conditions: conditions.length ? conditions : p.conditions,
                bloodType: output.bloodType || p.bloodType,
                foto: output.foto || p.foto,
                diet: {
                  ...(p.diet ?? emptyDiet()),
                  restrictions: {
                    allergies: restrictions,
                    intolerances: p.diet?.restrictions?.intolerances ?? [],
                  },
                },
              }
            : p
        )
      );
    } else {
      const id = generateId('pacient');
      const newPacient = {
        id,
        name: output.name,
        birthDate: output.age,
        foto: output.foto || null,
        conditions,
        emergencyContacts: [],
        heartRate: { current: 0, history: [] },
        bloodType: output.bloodType || '',
        weight: '',
        medicines: [],
        laudos: [],
        schedule: [],
        reports: [],
        checkins: [],
        diet: restrictions.length
          ? {
              ...emptyDiet(),
              restrictions: { allergies: restrictions, intolerances: [] },
            }
          : null,
      };
      setPacient((prev) => [...prev, newPacient]);
      setProfile((prev) => ({
        ...prev,
        pacientIds: [...(prev.pacientIds ?? []), id],
        selectedPacient: prev.selectedPacient ?? id,
      }));
    }
    closeForm();
  };

  const saveWeight = (output) => {
    updateSelectedPacient({ weight: output.weight });
  };

  // Atualiza a leitura atual de bpm do paciente selecionado e acrescenta
  // acompanhar. Ainda sem relação real com o relógio/horário do
  const saveHeartRate = (output) => {
    const currentHour24 = new Date().getHours();
    const minutes = new Date().getMinutes();
    const bpm = Number(output.current);
    if (!Number.isFinite(bpm)) {
      closeForm();
      return;
    }

    setPacient((prev) =>
      prev.map((p) => {
        if (p.id !== profile.selectedPacient) return p;
        const history = p.heartRate?.history ?? [];
        return {
          ...p,
          heartRate: {
            current: bpm,
            history: [...history, { hour: `${currentHour24}:${minutes}`, bpm }],
          },
        };
      })
    );
    closeForm();
  };

  const forms = {
    check: { component: CheckInF, output: saveCheckin },
    laudo: { component: LaudoF, output: saveLaudo },
    medicine: { component: MedicineF, output: saveMedicine },
    pacient: { component: PacientF, output: savePacient },
    stock: { component: StockF, output: saveStockProduct },
    task: { component: TaskF, output: saveTask },
    report: { component: ReportF, output: saveReport },
    createStock: { component: CreateStockF, output: createStock },
    connectStock: { component: ConnectStockF, output: connectToStock },
    connectPacient: { component: ConnectPacientF, output: connectToPacient },
    weight: { component: WeightF, output: saveWeight },
    heartRate: { component: HeartRateF, output: saveHeartRate },
  };

  const onSelectPacient = (id) => {
    setProfile((prev) => ({ ...prev, selectedPacient: id }));
  };

  const ActiveForm = forms[form];

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={{ flex: 1 }}>
        {splashscreen && (
          <>
            <Splash
              state={splashscreen}
              handler={setSplashscreen}
              onAuthenticated={handleAuthenticated}
            />
          </>
        )}
        {isLoggedIn ? (
          <>
            <AppCycle
              openForm={openForm}
              profilestuff={profile}
              pacientstuff={pacient}
              stockstuff={stock}
              onSelectPacient={onSelectPacient}
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
            {!splashscreen && (
              <>
                <TopMenu
                  prototypeHeight={prototypeHeight}
                  prototypeWidth={prototypeWidth}
                  userImg={userImg}
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
      </View>
    </NavigationContainer>
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
