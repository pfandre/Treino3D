/**
 * Base de Dados Especialista em Preparação Física & Treinamento de Atletas de Alto Rendimento
 * Baseado na anatomia detalhada do painel de treinamento muscular
 */

export const MUSCLE_DATABASE = {
  pecho: {
    id: "pecho",
    name: "Peitoral (Pecho - Pectoral Mayor & Menor)",
    anatomicalNames: ["Pectoral Mayor (Clavicular, Esternocostal, Abdominal)", "Pectoral Menor", "Serrato Anterior"],
    color: "#84CC16",
    colorRgb: "255, 51, 0",
    view: "front",
    description: "O peitoral é uma grande massa muscular em formato de leque. Nos esportes de rendimento, garante transferência de potência empurrando adversários, arremessos e socos.",
    bioMechanicsTips: "Atletas devem trabalhar em múltiplos ângulos (0°, 15°, 30°, 45°). A retração e depressão escapular são obrigatórias para proteger a articulação acromioclavicular sob altas cargas.",
    exercises: [
      {
        id: "ex_pecho_1",
        name: "Supino Inclinado com Halteres (30°)",
        targetHead: "Peitoral Superior (Porção Clavicular)",
        equipment: "Halteres + Banco Inclinado",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Ajuste o banco em 30°. Retraia as escápulas, desça os halteres com rotação neutra-pronada até o alinhamento com a axila e empurre acelerando na fase concêntrica.",
        biomechanics: "Maior ativação da cabeça clavicular com redução do torque deletério no ombro."
      },
      {
        id: "ex_pecho_2",
        name: "Supino Reto com Barra Olímpica",
        targetHead: "Peitoral Médio (Porção Esternocostal)",
        equipment: "Barra Olímpica + Banco Reto",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 5-8 reps (Foco em Força)",
        instructions: "Pegada 1.5x a largura dos ombros. Leg drive ativo (pés empurrando o chão), barra toca o esterno inferior e sobe em arco jota invertido (J-curve).",
        biomechanics: "Exercício fundamental para recrutamento de unidades motoras de limiar elevado (fibras tipo IIb)."
      },
      {
        id: "ex_pecho_3",
        name: "Crucifixo Reto no Cabo (Cable Fly)",
        targetHead: "Peitoral Médio & Miolo (Tensão Contínua)",
        equipment: "Polia Dupla Crossover",
        difficulty: "Intermediário",
        setsReps: "3 séries x 12-15 reps",
        instructions: "Polia na altura dos ombros. Dê um passo à frente com base assimétrica. Traga as mãos em direção ao centro espremendo o peitoral no final.",
        biomechanics: "Fornece resistência vetorial constante mesmo no pico de encurtamento muscular."
      },
      {
        id: "ex_pecho_4",
        name: "Supino Declinado com Barra / Halteres",
        targetHead: "Peitoral Inferior (Porção Abdominal)",
        equipment: "Banco Declinado (-15°)",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Fixe as pernas no suporte. Desça a carga em direção à linha inferior do tórax e empurre mantendo os cotovelos firmes.",
        biomechanics: "Recruta intensamente a porção inferior com menor Amplitude de Movimento do ombro."
      },
      {
        id: "ex_pecho_5",
        name: "Flexão de Braço Pliométrica (Explosive Push-Up)",
        targetHead: "Potência & Taxa de Desenvolvimento de Força (RFD)",
        equipment: "Peso Corporal / Anilha",
        difficulty: "Avançado (Atletas)",
        setsReps: "5 séries x 5 reps explosivas",
        instructions: "Desça rápido e empurre o chão com tanta velocidade que as mãos deolem do solo (com palmas se possível).",
        biomechanics: "Desenvolve a taxa de produção de força explosiva na cadeia anterior superior."
      },
      {
        id: "ex_pecho_6",
        name: "Dips nas Paralelas com Sobrecarga",
        targetHead: "Peitoral Inferior & Tríceps",
        equipment: "Barras Paralelas + Cinto de Carga",
        difficulty: "Avançado",
        setsReps: "4 séries x 6-8 reps",
        instructions: "Incline o tronco para a frente (~30°), dobre os joelhos e desça até sentir o alongamento profundo do peitoral antes de subir.",
        biomechanics: "Excelente exercício de peso corporal com carga para força bruta e hipertrofia."
      },
      {
        id: "ex_pecho_7",
        name: "Supino no Banco Inclinado 45° com Barra",
        targetHead: "Porção Clavicular Alta",
        equipment: "Barra + Banco 45°",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Desça a barra no osso da clavícula com controle estrito e empurre sem estender exageradamente os cotovelos.",
        biomechanics: "Foco extremo no preenchimento do peito superior."
      },
      {
        id: "ex_pecho_8",
        name: "Pullover com Halter no Banco Transversal",
        targetHead: "Peitoral Superior, Serrato & Expansão Torácica",
        equipment: "Halter + Banco Reto",
        difficulty: "Intermediário",
        setsReps: "3 séries x 12 reps",
        instructions: "Apoie apenas as escápulas no banco. Com braços levemente flexionados, desça o halter atrás da cabeça alongando a caixa torácica.",
        biomechanics: "Alongamento sob carga do peitoral menor, serrato e latíssimo."
      },
      {
        id: "ex_pecho_9",
        name: "Peck Deck / Voador Unilateral no Aparelho",
        targetHead: "Isolamento & Conexão Mente-Músculo",
        equipment: "Máquina Voador",
        difficulty: "Iniciante",
        setsReps: "3 séries x 12-15 reps",
        instructions: "Trabalhe um lado por vez focando na rotação interna e adução do braço no plano horizontal.",
        biomechanics: "Elimina assimetrias entre o lado dominante e não dominante."
      },
      {
        id: "ex_pecho_10",
        name: "Supino Unilateral no Crossover (Landmine / Cable Press)",
        targetHead: "Potência Específica de Golpe / Arremesso",
        equipment: "Barra Landmine ou Cabo",
        difficulty: "Atleta",
        setsReps: "4 séries x 8 reps por lado",
        instructions: "De pé, empurre a barra diagonalmente à frente transferindo energia do quadril para a mão contrária.",
        biomechanics: "Transferência de força rotacional em cadeia cinética fechada."
      }
    ]
  },

  hombros: {
    id: "hombros",
    name: "Ombros (Deltoides - Anterior, Lateral & Posterior)",
    anatomicalNames: ["Deltoide Cabeza Anterior", "Deltoide Cabeza Media (Lateral)", "Deltoide Cabeza Posterior"],
    color: "#84CC16",
    colorRgb: "255, 0, 0",
    view: "front",
    description: "Os deltoides revestem a articulação glenoumeral. São fundamentais para a largura do tronco, estabilidade aérea em arremessos e proteção contra luxações.",
    bioMechanicsTips: "A elevação lateral deve ser feita no plano da escápula (30° à frente da linha do corpo) para evitar colisão do impacto subacromial.",
    exercises: [
      {
        id: "ex_hombros_1",
        name: "Desenvolvimento Militar de Pé com Barra (OHP)",
        targetHead: "Deltoide Anterior & Estabilidade de Core",
        equipment: "Barra Olímpica",
        difficulty: "Avançado",
        setsReps: "4 séries x 5-8 reps",
        instructions: "De pé, glúteos e abdômen travados. Empurre a barra verticalmente passando rente ao rosto até o bloqueio acoplado acima da cabeça.",
        biomechanics: "Teste máximo de força funcional acima da cabeça."
      },
      {
        id: "ex_hombros_2",
        name: "Elevação Lateral com Halteres no Plano Escapular",
        targetHead: "Deltoide Lateral (Cabeça Média)",
        equipment: "Halteres",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Incline o tronco 5° para a frente. Eleve os braços em 30° à frente da linha dos ombros até a altura paralela ao chão.",
        biomechanics: "Recrutamento máximo do deltoide lateral sem pinçamento mecânico."
      },
      {
        id: "ex_hombros_3",
        name: "Face Pull no Cabo com Corda e Rotação Externa",
        targetHead: "Deltoide Posterior & Manguito Rotador",
        equipment: "Polia Alta + Corda",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 15 reps",
        instructions: "Puxe a corda para os olhos abrindo as pontas da corda para fora e mostrando as palmas para a frente no final.",
        biomechanics: "Essencial para correção postural e saúde dos ombros de atletas arremessadores."
      },
      {
        id: "ex_hombros_4",
        name: "Desenvolvimento Arnold com Halteres",
        targetHead: "Três Cabeças do Deltoide",
        equipment: "Halteres + Banco 85°",
        difficulty: "Intermediário",
        setsReps: "3 séries x 10-12 reps",
        instructions: "Inicie com os halteres à frente do peito e palmas viradas para você. Ao empurrar, rode o punho para fora até a extensão completa.",
        biomechanics: "Movimento em espiral que recruta deltoide anterior e lateral em grande amplitude."
      },
      {
        id: "ex_hombros_5",
        name: "Crucifixo Invertido com Halteres no Banco Inclinado",
        targetHead: "Deltoide Posterior",
        equipment: "Halteres + Banco 30°",
        difficulty: "Intermediário",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Deitado de bruços no banco, abduza os braços para os lados focando o esforço atrás dos ombros.",
        biomechanics: "Isola a porção posterior reduzindo a compensação do trapézio."
      },
      {
        id: "ex_hombros_6",
        name: "Elevação Y no Banco Inclinado (Prone Y-Raise)",
        targetHead: "Deltoide Posterior & Trapézio Inferior",
        equipment: "Halteres Leves",
        difficulty: "Intermediário",
        setsReps: "3 séries x 12 reps",
        instructions: "Suba os braços num ângulo de 45° (formato Y) com o polegar apontado para o teto.",
        biomechanics: "Fortalece os estabilizadores da escápula e diminui o risco de lesões de ombro."
      },
      {
        id: "ex_hombros_7",
        name: "Push Press com Barra (Desenvolvimento com Impulso)",
        targetHead: "Potência Atlética & Transferência de Pernas",
        equipment: "Barra Olímpica",
        difficulty: "Atleta / Avançado",
        setsReps: "5 séries x 3-5 reps explosivas",
        instructions: "Flexione levemente os joelhos (dip) e empurre explosivamente com as pernas transferindo o impulso para os ombros.",
        biomechanics: "Desenvolve taxa de desenvolvimento de força (RFD) de corpo inteiro."
      },
      {
        id: "ex_hombros_8",
        name: "Elevação Frontal na Polia com Barra Reta",
        targetHead: "Deltoide Anterior",
        equipment: "Polia Baixa",
        difficulty: "Iniciante",
        setsReps: "3 séries x 12 reps",
        instructions: "Passe o cabo por entre as pernas. Suba a barra até o nível dos olhos com controle.",
        biomechanics: "Tensão constante na porção frontal do ombro."
      },
      {
        id: "ex_hombros_9",
        name: "Bradford Press com Barra (Frente e Costas)",
        targetHead: "Resistência de Hipertrofia sob Tensão",
        equipment: "Barra",
        difficulty: "Avançado",
        setsReps: "3 séries x 15 reps contínuas",
        instructions: "Empurre a barra logo acima da cabeça e passe para trás do pescoço, depois retorne à frente sem descansar no topo.",
        biomechanics: "Mantém os deltoides sob tensão mecânica ininterrupta."
      },
      {
        id: "ex_hombros_10",
        name: "Lu Raises (Elevação Lateral Completa com Anilha)",
        targetHead: "Deltoide Lateral & Mobilidade Escapular",
        equipment: "Anilhas Fracionadas",
        difficulty: "Avançado",
        setsReps: "3 séries x 12 reps",
        instructions: "Eleve os braços lateralmente até que as anilhas se toquem acima da cabeça em arco completo.",
        biomechanics: "Técnica dos levantadores de peso olímpicos chineses para ombros blindados."
      }
    ]
  },

  biceps: {
    id: "biceps",
    name: "Bíceps & Braquial",
    anatomicalNames: ["Bíceps Braquial (Cabeza Larga)", "Bíceps Braquial (Cabeza Corta)", "Braquial"],
    color: "#84CC16",
    colorRgb: "255, 204, 0",
    view: "front",
    description: "Flexores do cotovelo e supinadores do antebraço. Essenciais para agarrar, puxar e suportar cargas coladas ao corpo.",
    bioMechanicsTips: "Varie a posição do ombro: braço atrás do tronco (rosca inclinada) foca na cabeça longa; braço à frente do tronco (rosca Scott) foca na cabeça curta.",
    exercises: [
      {
        id: "ex_biceps_1",
        name: "Rosca Direta com Barra W Olímpica",
        targetHead: "Bíceps Geral (Construção de Carga)",
        equipment: "Barra W + Anilhas",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Mantenha cotovelos estabilizados nas costelas. Suba a barra flexionando os braços sem balançar o quadril.",
        biomechanics: "Exercício fundamental para sobrecarga progressiva nos braços."
      },
      {
        id: "ex_biceps_2",
        name: "Rosca Inclinada 45° com Halteres",
        targetHead: "Cabeça Longa (Pico do Bíceps)",
        equipment: "Halteres + Banco 45°",
        difficulty: "Intermediário",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Deixe os braços pendurados verticalmente atrás do tronco. Suba supinando o punho no pico da contração.",
        biomechanics: "Máximo pré-alongamento da cabeça longa do bíceps."
      },
      {
        id: "ex_biceps_3",
        name: "Rosca Martelo com Halteres (Hammer Curl)",
        targetHead: "Braquial & Braquiorradial",
        equipment: "Halteres",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Pegada neutra (palmas viradas uma para a outra). Flexione os cotovelos mantendo os braços firmes.",
        biomechanics: "Aumenta a espessura lateral do braço empurrando o bíceps para cima."
      },
      {
        id: "ex_biceps_4",
        name: "Rosca Scott Unilateral com Halter ou Barra W",
        targetHead: "Cabeça Curta & Isolamento Distal",
        equipment: "Banco Scott",
        difficulty: "Intermediário",
        setsReps: "3 séries x 10-12 reps",
        instructions: "Apoie a axila no topo do estofado. Desça a carga até a extensão quase completa e suba com foco no bíceps.",
        biomechanics: "Elimina totalmente o impulso do tronco."
      },
      {
        id: "ex_biceps_5",
        name: "Rosca Spider (Banco Inclinado de Bruços)",
        targetHead: "Cabeça Curta (Pico Encurtado)",
        equipment: "Halteres + Banco 45°",
        difficulty: "Intermediário",
        setsReps: "3 séries x 12 reps",
        instructions: "Deite de bruços no banco inclinado. Deixe os braços caírem para a frente e suba os halteres.",
        biomechanics: "Tensão máxima na fase totalmente encurtada do músculo."
      },
      {
        id: "ex_biceps_6",
        name: "Rosca Concentrada Unilateral",
        targetHead: "Isolamento & Pico de Contração",
        equipment: "Halter",
        difficulty: "Iniciante",
        setsReps: "3 séries x 12 reps",
        instructions: "Apoie o cotovelo na parte interna da coxa. Flexione concentrando no bíceps.",
        biomechanics: "Zero auxílio de outros músculos da cintura escapular."
      },
      {
        id: "ex_biceps_7",
        name: "Chin-up (Barra Fixa Supinada) com Sobrecarga",
        targetHead: "Bíceps & Latíssimo (Força Relativa)",
        equipment: "Barra Fixa",
        difficulty: "Avançado",
        setsReps: "4 séries x 6-8 reps",
        instructions: "Pegada supinada na largura dos ombros. Suba até o peito quase tocar a barra.",
        biomechanics: "Exercício multiarticular mais potente para ganho de massa no bíceps."
      },
      {
        id: "ex_biceps_8",
        name: "Rosca Drag (Drag Curl) com Barra",
        targetHead: "Cabeça Longa (Sem Flexão de Ombro)",
        equipment: "Barra",
        difficulty: "Intermediário",
        setsReps: "3 séries x 12 reps",
        instructions: "Puxe a barra roçando pelo tronco para cima, arrastando os cotovelos para trás.",
        biomechanics: "Remove a participação do deltoide anterior."
      }
    ]
  },

  antebrazos: {
    id: "antebrazos",
    name: "Antebraços (Antebrazos & Pegada)",
    anatomicalNames: ["Braquiorradial", "Extensor del Carpo", "Flexor del Carpo"],
    color: "#84CC16",
    colorRgb: "40, 167, 69",
    view: "front",
    description: "Músculos que controlam o punho e os dedos. Uma pegada (grip) poderosa é o elo de ligação para levantamento terra, lutas e arrastos.",
    bioMechanicsTips: "Trabalhe tanto a flexão quanto a extensão de punho e sustentações isométricas pesadas.",
    exercises: [
      {
        id: "ex_antebrazo_1",
        name: "Rosca Inversa com Barra W",
        targetHead: "Braquiorradial & Extensores",
        equipment: "Barra W (Pegada Pronada)",
        difficulty: "Intermediário",
        setsReps: "4 séries x 12 reps",
        instructions: "Palmas voltadas para baixo. Flexione os cotovelos até 90°.",
        biomechanics: "Transfere a carga para o braquiorradial."
      },
      {
        id: "ex_antebrazo_2",
        name: "Flexão de Punho no Banco (Rosca Punho)",
        targetHead: "Flexores do Antebraço",
        equipment: "Barra ou Halteres",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 15 reps",
        instructions: "Apoie os antebraços na coxa. Flexione os punhos para cima.",
        biomechanics: "Isolamento dos flexores volumosos do antebraço."
      },
      {
        id: "ex_antebrazo_3",
        name: "Caminhada do Fazendeiro Pesada (Heavy Farmer Walk)",
        targetHead: "Pegada Isométrica & Força de Atleta",
        equipment: "Halteres Pesados",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 40 metros",
        instructions: "Segure dois halteres pesados e caminhe com postura impecável.",
        biomechanics: "Estresse mecânico brutal na pegada e trapézio."
      },
      {
        id: "ex_antebrazo_4",
        name: "Zottman Curl com Halteres",
        targetHead: "Bíceps na Subida + Antebraço na Descida",
        equipment: "Halteres",
        difficulty: "Intermediário",
        setsReps: "3 séries x 10 reps",
        instructions: "Suba com pegada supinada. No topo, rode o punho para pronado e desça bem devagar.",
        biomechanics: "Trabalha bíceps na fase concêntrica e extensores do antebraço na excêntrica."
      }
    ]
  },

  abdominales: {
    id: "abdominales",
    name: "Abdominais & Core (Recto Abdominal, Oblicuos & Serrato)",
    anatomicalNames: ["Recto Abdominal", "Oblicuo Externo", "Serrato Anterior", "Transverso del Abdomen"],
    color: "#84CC16",
    colorRgb: "255, 119, 0",
    view: "front",
    description: "Estabilizadores centrais da coluna. Atletas precisam de um core rígido para transferir força das pernas para os braços sem dissipar energia.",
    bioMechanicsTips: "Arredonde a coluna lombar levemente no pico de flexão para recrutar o reto abdominal.",
    exercises: [
      {
        id: "ex_abs_1",
        name: "Abdominal Infra na Barra (Hanging Leg Raise)",
        targetHead: "Porção Inferior do Recto Abdominal",
        equipment: "Barra Fixa",
        difficulty: "Intermediário",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Pendurado, eleve as pernas girando a pelve para cima.",
        biomechanics: "Envolve retroversão pélvica para recrutamento infra."
      },
      {
        id: "ex_abs_2",
        name: "Abdominal Ajoelhado na Polia (Cable Crunch)",
        targetHead: "Recto Abdominal Geral (Sobrecarga)",
        equipment: "Polia Alta + Corda",
        difficulty: "Intermediário",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Ajoelhado em frente ao cabo, flexione o tronco trazendo os cotovelos aos joelhos.",
        biomechanics: "Permite carga progressiva ajustável."
      },
      {
        id: "ex_abs_3",
        name: "Abdominal Roda (Ab Wheel Rollout)",
        targetHead: "Core Completo & Estabilidade Anti-Extensão",
        equipment: "Roda Abdominal",
        difficulty: "Avançado",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Role para a frente mantendo a lombar firme e retorne puxando pelo abdômen.",
        biomechanics: "Tensão excêntrica altíssima na cadeia anterior."
      },
      {
        id: "ex_abs_4",
        name: "Prancha Isométrica com Carga nas Costas",
        targetHead: "Transverso do Abdômen",
        equipment: "Anilha nas Costas",
        difficulty: "Todos os níveis",
        setsReps: "3 séries x 60 segundos",
        instructions: "Mantenha o corpo em linha reta travando glúteos e abdômen.",
        biomechanics: "Estabilidade estática para coluna vertebral."
      },
      {
        id: "ex_abs_5",
        name: "Pallof Press na Polia (Anti-Rotação)",
        targetHead: "Oblíquos & Estabilidade Rotacional",
        equipment: "Polia / Elástico",
        difficulty: "Atleta",
        setsReps: "3 séries x 12 reps por lado",
        instructions: "De lado para o cabo, empurre a manopla para a frente sem deixar o corpo girar.",
        biomechanics: "Prepara atletas para resistir a forças de torção no tronco."
      }
    ]
  },

  espalda: {
    id: "espalda",
    name: "Costas (Espalda Superior, Dorsal & Lombar)",
    anatomicalNames: ["Dorsal Ancho (Latíssimo)", "Trapecio", "Redondo Mayor", "Romboide", "Erector Espinal"],
    color: "#84CC16",
    colorRgb: "255, 69, 0",
    view: "back",
    description: "A maior estrutura muscular da parte posterior do tronco. Dá a forma V-taper e protege a coluna contra grandes forças de tração.",
    bioMechanicsTips: "Puxadas verticais constroem largura. Remadas horizontais constroem espessura e relevo no miolo das costas.",
    exercises: [
      {
        id: "ex_espalda_1",
        name: "Puxada Alta com Pegada Aberta (Lat Pulldown)",
        targetHead: "Dorsal Ancho (Largura)",
        equipment: "Polia Alta",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Puxe a barra no peito cravando os cotovelos para baixo.",
        biomechanics: "Adução do ombro para expansão da 'asa' do dorsal."
      },
      {
        id: "ex_espalda_2",
        name: "Remada Curvada com Barra Olímpica (Barbell Row)",
        targetHead: "Densidade de Costas & Romboides",
        equipment: "Barra + Anilhas",
        difficulty: "Intermediário / Avançado",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Tronco inclinado a 45°. Puxe a barra no umbigo espremendo as escápulas.",
        biomechanics: "Trabalho pesado de espessura e força eretora."
      },
      {
        id: "ex_espalda_3",
        name: "Remada Unilateral com Halter (Serrote)",
        targetHead: "Dorsal Ancho Inferior",
        equipment: "Halter + Banco",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 10-12 reps por lado",
        instructions: "Puxe o halter em direção ao quadril numa trajetória em arco.",
        biomechanics: "Grande amplitude e isolamento por lado."
      },
      {
        id: "ex_espalda_4",
        name: "Barra Fixa (Pull-up) com Sobrecarga",
        targetHead: "Dorsal & Potência Relativa",
        equipment: "Barra Fixa",
        difficulty: "Avançado",
        setsReps: "4 séries x 6-8 reps",
        instructions: "Suba até o queixo passar da barra com contração total.",
        biomechanics: "Exercício fundamental de peso corporal para atletas."
      },
      {
        id: "ex_espalda_5",
        name: "Meio Levantamento Terra no Rack (Rack Pull)",
        targetHead: "Trapézio, Romboides & Lombar (Massa Bruta)",
        equipment: "Barra + Gaiola (altura do joelho)",
        difficulty: "Avançado",
        setsReps: "4 séries x 5 reps pesadas",
        instructions: "Puxe a barra travando o quadril e juntando as escápulas no topo.",
        biomechanics: "Sobrecarga supra-máxima na cadeia posterior superior."
      },
      {
        id: "ex_espalda_6",
        name: "Remada Cavalo T-Bar com Pegada Neutra",
        targetHead: "Miolo de Costas & Trapézio Médio",
        equipment: "Aparelho T-Bar",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Puxe o suporte no peito espremendo a musculatura central das costas.",
        biomechanics: "Segurança lombar com grande capacidade de carga."
      }
    ]
  },

  triceps: {
    id: "triceps",
    name: "Tríceps (Tríceps Braquial - 3 Cabeças)",
    anatomicalNames: ["Tríceps Braquial (Cabeza Lateral, Larga y Medial)"],
    color: "#84CC16",
    colorRgb: "255, 204, 0",
    view: "back",
    description: "Extensor principal do cotovelo, responsável por 60% do volume do braço e vital em todos os supinos e empurrões.",
    bioMechanicsTips: "Exercícios acima da cabeça pré-alongam a cabeça longa; extensões na polia focam na cabeça lateral.",
    exercises: [
      {
        id: "ex_triceps_1",
        name: "Tríceps Testa com Barra W (Skullcrusher)",
        targetHead: "Cabeça Larga & Medial",
        equipment: "Banco Reto + Barra W",
        difficulty: "Intermediário",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Desça a barra até a testa estendendo completamente no topo.",
        biomechanics: "Construtor clássico de massa muscular no tríceps."
      },
      {
        id: "ex_triceps_2",
        name: "Tríceps Pulley com Corda na Polia Alta",
        targetHead: "Cabeça Lateral (Definição em Ferradura)",
        equipment: "Polia Alta + Corda",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Empurre para baixo e abra as pontas da corda para fora no final.",
        biomechanics: "Tensão constante com pico de contração lateral."
      },
      {
        id: "ex_triceps_3",
        name: "Tríceps Francês no Banco com Halter Unilateral",
        targetHead: "Cabeça Larga (Pré-alongamento)",
        equipment: "Halter",
        difficulty: "Intermediário",
        setsReps: "3 séries x 12 reps por braço",
        instructions: "Braço ereto ao lado da cabeça. Desça o halter atrás do pescoço.",
        biomechanics: "Alongamento completo na cabeça longa do tríceps."
      },
      {
        id: "ex_triceps_4",
        name: "Paralelas para Tríceps (Dips de Braço)",
        targetHead: "Tríceps Geral & Força Relativa",
        equipment: "Barras Paralelas",
        difficulty: "Intermediário / Avançado",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Corpo vertical, flexione os cotovelos a 90° e empurre forte.",
        biomechanics: "Excelente construtor de força bruta nos extensores do cotovelo."
      }
    ]
  },

  gluteos: {
    id: "gluteos",
    name: "Glúteos (Glúteo Máximo, Médio & Mínimo)",
    anatomicalNames: ["Glúteo Mayor", "Glúteo Mediano", "Glúteo Menor"],
    color: "#84CC16",
    colorRgb: "0, 128, 128",
    view: "back",
    description: "O motor primário da extensão do quadril, corridas de velocidade, saltos e arrancos atléticos.",
    bioMechanicsTips: "Elevação pélvica (Hip Thrust) produz o maior pico de força no ponto de contração total.",
    exercises: [
      {
        id: "ex_gluteos_1",
        name: "Elevação Pélvica com Barra Olímpica (Hip Thrust)",
        targetHead: "Glúteo Máximo (Pico de Contração)",
        equipment: "Banco + Barra com Almofada",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-12 reps",
        instructions: "Empurre a barra para cima espremendo os glúteos no topo por 2s.",
        biomechanics: "Maior ativação eletromiográfica do glúteo máximo."
      },
      {
        id: "ex_gluteos_2",
        name: "Agachamento Sumô Profundo com Barra",
        targetHead: "Glúteo Máximo & Aductores",
        equipment: "Barra Olímpica",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Base bem aberta, pontas dos pés para fora. Agache fundo mantendo os joelhos alinhados aos pés.",
        biomechanics: "Trabalho profundo na cadeia pélvica."
      },
      {
        id: "ex_gluteos_3",
        name: "Glúteo Coice no Cabo (Cable Kickback)",
        targetHead: "Porção Superior do Glúteo Máximo",
        equipment: "Polia Baixa + Tornozeleira",
        difficulty: "Todos os níveis",
        setsReps: "3 séries x 12-15 reps",
        instructions: "Empurre a perna para trás e ligeiramente para fora.",
        biomechanics: "Tensão constante ao longo de toda a extensão."
      }
    ]
  },

  quadriceps: {
    id: "quadriceps",
    name: "Quadríceps (Coxa Anterior)",
    anatomicalNames: ["Recto Femoral", "Vasto Lateral", "Vasto Medial", "Vasto Intermedio"],
    color: "#84CC16",
    colorRgb: "111, 66, 193",
    view: "front",
    description: "Quatro músculos potentes na frente da coxa, responsáveis pela extensão do joelho e desaceleração atlética.",
    bioMechanicsTips: "Joelhos avançando além da ponta dos pés aumentam o braço de momento sobre o joelho, hipertrofiando o quadríceps.",
    exercises: [
      {
        id: "ex_quads_1",
        name: "Agachamento Livre com Barra (High Bar Squat)",
        targetHead: "Quadríceps Geral (Rei dos Exercícios)",
        equipment: "Barra + Anilha + Gaiola",
        difficulty: "Intermediário / Avançado",
        setsReps: "4 séries x 6-10 reps",
        instructions: "Barra no trapézio. Agache abaixo do paralelo empurrando o chão com o peito do pé.",
        biomechanics: "Desenvolvimento muscular sistêmico e massa de perna."
      },
      {
        id: "ex_quads_2",
        name: "Leg Press 45° Pesado",
        targetHead: "Vasto Lateral & Medial",
        equipment: "Leg Press 45°",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Pés na largura dos ombros. Desça o carrinho até 90° e empurre.",
        biomechanics: "Permite carga extrema sem estresse de compressão na coluna."
      },
      {
        id: "ex_quads_3",
        name: "Agachamento Búlgaro com Halteres",
        targetHead: "Quadríceps Unilateral & Estabilidade",
        equipment: "Halteres + Banco",
        difficulty: "Intermediário",
        setsReps: "4 séries x 10 reps por perna",
        instructions: "Pé traseiro apoiado no banco. Desça em agachamento profundo.",
        biomechanics: "Corrige assimetrias de força entre as pernas."
      },
      {
        id: "ex_quads_4",
        name: "Cadeira Extensora (Leg Extension)",
        targetHead: "Recto Femoral (Isolamento)",
        equipment: "Máquina Extensora",
        difficulty: "Iniciante",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Estenda completamente as pernas e segure 1 segundo no topo.",
        biomechanics: "Tensão máxima isolada na fase encurtada."
      }
    ]
  },

  femorales: {
    id: "femorales",
    name: "Isquiotibiais / Femorais (Posterior de Coxa)",
    anatomicalNames: ["Bíceps Femoral (Larga y Corta)", "Semitendinoso", "Semimembranoso"],
    color: "#84CC16",
    colorRgb: "90, 42, 130",
    view: "back",
    description: "Musculatura posterior da coxa, vital para prevenção de lesões de ligamento cruzado anterior (LCA) e arranque rápido.",
    bioMechanicsTips: "RDL estimula os isquiotibiais na anca; mesa flexora estimula na flexão articular do joelho.",
    exercises: [
      {
        id: "ex_femorales_1",
        name: "Levantamento Terra Romeno (RDL com Barra)",
        targetHead: "Isquiotibiais (Alongamento na Anca)",
        equipment: "Barra Olímpica",
        difficulty: "Intermediário",
        setsReps: "4 séries x 8-10 reps",
        instructions: "Empurre o quadril para trás mantendo os joelhos destravados. Desça a barra até o meio da canela.",
        biomechanics: "Hipertrofia mediada pelo alongamento sob tensão."
      },
      {
        id: "ex_femorales_2",
        name: "Mesa Flexora Deitado (Lying Leg Curl)",
        targetHead: "Bíceps Femoral & Flexão de Joelho",
        equipment: "Mesa Flexora",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 10-12 reps",
        instructions: "Deitado de bruços, traga o rolete até os glúteos com controle.",
        biomechanics: "Isolamento direto dos isquiotibiais distalmente."
      },
      {
        id: "ex_femorales_3",
        name: "Flexão Nórdica de Posterior (Nordic Hamstring Curl)",
        targetHead: "Força Excêntrica Proteção de Joelho",
        equipment: "Apoio para Tornozelos / Solo",
        difficulty: "Atleta / Avançado",
        setsReps: "3 séries x 6-8 reps excêntricas",
        instructions: "Ajoelhado com pés fixos, projete o corpo para a frente segurando a descida o máximo possível.",
        biomechanics: "Reduz drasticamente lesões musculares em esportes de alta velocidade."
      }
    ]
  },

  pantorrillas: {
    id: "pantorrillas",
    name: "Panturrilhas (Gemelos - Gastrocnêmio & Sóleo)",
    anatomicalNames: ["Gastrocnemio (Cabeza Medial y Lateral)", "Sóleo", "Tibial Anterior"],
    color: "#84CC16",
    colorRgb: "138, 43, 226",
    view: "front",
    description: "A bomba muscular inferior do corpo humano. Absorvem impacto nos saltos e geram impulso inicial de aceleração.",
    bioMechanicsTips: "Gêmeos em pé recruta o gastrocnêmio; gêmeos sentado isola o sóleo.",
    exercises: [
      {
        id: "ex_calves_1",
        name: "Gêmeos em Pé na Máquina / Leg Press",
        targetHead: "Gastrocnêmio (Cabeça Interna e Externa)",
        equipment: "Máquina Gêmeos / Leg Press",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 12-15 reps com pausa de 2s embaixo",
        instructions: "Com joelhos estendidos, desça os calcanhares até o alongamento máximo e suba na ponta dos pés.",
        biomechanics: "Maior recrutamento do gastrocnêmio com joelho reto."
      },
      {
        id: "ex_calves_2",
        name: "Gêmeos Sentado na Máquina (Soleus Raise)",
        targetHead: "Músculo Sóleo",
        equipment: "Máquina Gêmeos Sentado",
        difficulty: "Iniciante",
        setsReps: "4 séries x 15-20 reps",
        instructions: "Com joelhos dobrados a 90°, eleve o suporte subindo o calcanhar.",
        biomechanics: "Isolamento estrito do músculo sóleo sob o joelho flexionado."
      },
      {
        id: "ex_calves_3",
        name: "Elevação Tibial Anterior (Tib Raise)",
        targetHead: "Tibial Anterior (Prevenção de Canelite)",
        equipment: "Anilha ou Solo",
        difficulty: "Todos os níveis",
        setsReps: "3 séries x 20 reps",
        instructions: "Encoste as costas na parede e suba as pontas dos pés apontando para as canelas.",
        biomechanics: "Fortalece a desaceleração do tornozelo."
      }
    ]
  },

  trapezio: {
    id: "trapezio",
    name: "Trapézio (Trapecio)",
    anatomicalNames: ["Trapecio Superior", "Trapecio Medio"],
    color: "#84CC16",
    colorRgb: "204, 0, 0",
    view: "back",
    description: "Músculo localizado na parte superior das costas e pescoço. O trapézio superior eleva as escápulas e é fundamental para estabilidade e força.",
    bioMechanicsTips: "Movimentos de encolhimento e puxadas altas constroem densidade nesta região. Pause no topo da contração.",
    exercises: [
      {
        id: "ex_trapezio_1",
        name: "Encolhimento com Barra (Barbell Shrug)",
        targetHead: "Trapézio Superior",
        equipment: "Barra Olímpica",
        difficulty: "Todos os níveis",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Com os braços esticados, eleve os ombros em direção às orelhas. Segure a contração no topo e desça devagar.",
        biomechanics: "Foco principal na elevação escapular e sobrecarga mecânica."
      },
      {
        id: "ex_trapezio_2",
        name: "Encolhimento com Halteres",
        targetHead: "Trapézio Superior & Médio",
        equipment: "Halteres",
        difficulty: "Iniciante",
        setsReps: "4 séries x 12-15 reps",
        instructions: "Com os halteres ao lado do corpo, encolha os ombros sem dobrar os cotovelos.",
        biomechanics: "Pegada neutra que alivia tensão nos ombros e permite melhor encaixe."
      },
      {
        id: "ex_trapezio_3",
        name: "Remada Alta com Pegada Larga (Upright Row)",
        targetHead: "Trapézio & Deltoide Lateral",
        equipment: "Barra ou Polia",
        difficulty: "Intermediário",
        setsReps: "3 séries x 10-12 reps",
        instructions: "Puxe a barra até a altura do peito, conduzindo o movimento com os cotovelos acima da linha da barra.",
        biomechanics: "Excelente para a parte média do trapézio e estabilização escapular."
      }
    ]
  }
};
