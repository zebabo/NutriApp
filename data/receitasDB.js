// src/data/receitasDB.js

export const receitasPortuguesas = [
  // ==========================================
  // PEQUENO-ALMOÇO
  // ==========================================
  {
    id: '1',
    title: 'Papas de Aveia e Maçã',
    category: 'Pequeno-almoço',
    type: 'Perder',
    kcal: 290, protein: 12, carbs: 45, fats: 5,
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=500',
    ingredients: ['40g Aveia', '200ml Leite magro', '1 Maçã', 'Canela'],
    steps: ['Cozinhar a aveia no leite', 'Juntar a maçã ralada', 'Polvilhar com canela']
  },
  {
    id: '2',
    title: 'Omelete de Claras e Queijo Fresco',
    category: 'Pequeno-almoço',
    type: 'Perder',
    kcal: 210, protein: 28, carbs: 4, fats: 7,
    image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d4ec?q=80&w=500',
    ingredients: ['4 Claras', '1 Ovo inteiro', '50g Queijo fresco light', 'Espinafres'],
    steps: ['Bater os ovos', 'Cozinhar na frigideira antiaderente', 'Rechear com queijo e espinafres']
  },
  {
    id: '3',
    title: 'Batido Energético de Banana',
    category: 'Pequeno-almoço',
    type: 'Ganhar',
    kcal: 550, protein: 35, carbs: 75, fats: 12,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=500',
    ingredients: ['1 Banana', '60g Aveia', '1 scoop Whey', '300ml Leite gordo', '10g Mel'],
    steps: ['Triturar tudo no liquidificador', 'Beber fresco']
  },
  {
    id: '4',
    title: 'Tostas de Alfarroba com Ovos',
    category: 'Pequeno-almoço',
    type: 'Ganhar',
    kcal: 480, protein: 25, carbs: 55, fats: 18,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500',
    ingredients: ['2 Fatias pão alfarroba', '2 Ovos', '1/2 Abacate', 'Sementes sésamo'],
    steps: ['Torrar o pão', 'Colocar abacate esmagado', 'Ovos escalfados por cima']
  },
  {
    id: '5',
    title: 'Iogurte Grego com Granola Caseira',
    category: 'Pequeno-almoço',
    type: 'Perder',
    kcal: 310, protein: 22, carbs: 30, fats: 8,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500',
    ingredients: ['150g Iogurte grego ligeiro', '20g Granola zero açúcar', 'Mirtilos'],
    steps: ['Misturar o iogurte com a granola', 'Adicionar frutos vermelhos']
  },

  // ==========================================
  // ALMOÇO
  // ==========================================
  {
    id: '6',
    title: 'Bacalhau com Crosta de Broa',
    category: 'Almoço',
    type: 'Perder',
    kcal: 340, protein: 38, carbs: 18, fats: 9,
    image: 'https://images.unsplash.com/photo-1534940859016-d3d6395e2670?q=80&w=500',
    ingredients: ['Lombo de bacalhau', '15g Broa integral', 'Alho', 'Couve-flor'],
    steps: ['Cozer o bacalhau', 'Cobrir com broa picada e alho', 'Levar ao forno']
  },
  {
    id: '7',
    title: 'Arroz de Frango Malandrinho',
    category: 'Almoço',
    type: 'Ganhar',
    kcal: 620, protein: 42, carbs: 80, fats: 12,
    image: 'https://images.unsplash.com/photo-1512058560366-cd2429555e54?q=80&w=500',
    ingredients: ['150g Peito frango', '100g Arroz carolino', 'Tomate', 'Pimento'],
    steps: ['Fazer refogado de tomate', 'Cozinhar o frango e arroz com caldo abundante']
  },
  {
    id: '8',
    title: 'Pescada à Poveira Fit',
    category: 'Almoço',
    type: 'Perder',
    kcal: 290, protein: 35, carbs: 12, fats: 6,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500',
    ingredients: ['Mimos de pescada', 'Ovo cozido', 'Cenoura', 'Feijão verde'],
    steps: ['Cozer o peixe e legumes', 'Temperar com 1 colher de azeite e vinagre']
  },
  {
    id: '9',
    title: 'Bife da Vazia com Batata Doce',
    category: 'Almoço',
    type: 'Ganhar',
    kcal: 680, protein: 50, carbs: 65, fats: 22,
    image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=500',
    ingredients: ['200g Bife vazia', '200g Batata doce', 'Brócolos'],
    steps: ['Grelhar o bife', 'Assar a batata doce às rodelas']
  },
  {
    id: '10',
    title: 'Salada de Grão com Atum',
    category: 'Almoço',
    type: 'Perder',
    kcal: 380, protein: 32, carbs: 35, fats: 10,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
    ingredients: ['Atum ao natural', '120g Grão cozido', 'Cebola', 'Salsa', 'Ovo cozido'],
    steps: ['Misturar tudo numa taça', 'Picar a salsa e cebola finamente']
  },

  // ==========================================
  // LANCHE
  // ==========================================
  {
    id: '11',
    title: 'Panquecas de Banana e Whey',
    category: 'Lanche',
    type: 'Ganhar',
    kcal: 450, protein: 32, carbs: 50, fats: 10,
    image: 'https://images.unsplash.com/photo-1528443338945-c120d93a0279?q=80&w=500',
    ingredients: ['1 Banana', '1 Ovo', '30g Aveia', '1/2 scoop Whey'],
    steps: ['Esmagar banana', 'Misturar com ovo e aveia', 'Dourar na frigideira']
  },
  {
    id: '12',
    title: 'Gelatina de Proteína e Queijo Quark',
    category: 'Lanche',
    type: 'Perder',
    kcal: 140, protein: 20, carbs: 8, fats: 1,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=500',
    ingredients: ['200g Queijo Quark 0%', '1 Pacote gelatina zero'],
    steps: ['Fazer a gelatina', 'Quando começar a prender, bater com o quark']
  },
  {
    id: '13',
    title: 'Sandes de Peru em Pão de Centeio',
    category: 'Lanche',
    type: 'Perder',
    kcal: 260, protein: 18, carbs: 32, fats: 5,
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?q=80&w=500',
    ingredients: ['2 Fatias pão centeio', 'Peito peru fumado', 'Alface', 'Tomate'],
    steps: ['Montar a sandes com vegetais frescos']
  },
  {
    id: '14',
    title: 'Muffins de Aveia e Maçã',
    category: 'Lanche',
    type: 'Ganhar',
    kcal: 380, protein: 15, carbs: 60, fats: 12,
    image: 'https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?q=80&w=500',
    ingredients: ['Aveia', 'Mel', 'Ovos', 'Maçã em cubos', 'Nozes'],
    steps: ['Misturar ingredientes secos e húmidos', 'Levar ao forno em formas']
  },
  {
    id: '15',
    title: 'Queijo Fresco com Amêndoas',
    category: 'Lanche',
    type: 'Perder',
    kcal: 190, protein: 16, carbs: 5, fats: 12,
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=500',
    ingredients: ['1 Queijo fresco médio', '10 Amêndoas'],
    steps: ['Comer o queijo acompanhado das amêndoas ao natural']
  },

  // ==========================================
  // JANTAR
  // ==========================================
  {
    id: '16',
    title: 'Dourada Grelhada com Legumes',
    category: 'Jantar',
    type: 'Perder',
    kcal: 280, protein: 32, carbs: 5, fats: 14,
    image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=500',
    ingredients: ['1 Dourada', 'Curgete', 'Pimentos', 'Espargos'],
    steps: ['Grelhar o peixe', 'Saltear os legumes com pouco azeite']
  },
  {
    id: '17',
    title: 'Arroz de Pato Desfiado (Light)',
    category: 'Jantar',
    type: 'Ganhar',
    kcal: 650, protein: 45, carbs: 70, fats: 18,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=500',
    ingredients: ['Pato cozido', 'Arroz integral', 'Chouriço de aves', 'Laranja'],
    steps: ['Desfiar o pato', 'Cozinhar arroz no caldo do pato', 'Levar a gratinar']
  },
  {
    id: '18',
    title: 'Frango com Caril e Couve-Flor',
    category: 'Jantar',
    type: 'Perder',
    kcal: 310, protein: 38, carbs: 10, fats: 8,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500',
    ingredients: ['Peito frango', '"Arroz" de couve-flor', 'Caril', 'Leite coco light'],
    steps: ['Estufar o frango com caril', 'Servir sobre couve-flor picada']
  },
  {
    id: '19',
    title: 'Lasanha de Curgete e Vaca',
    category: 'Jantar',
    type: 'Perder',
    kcal: 390, protein: 42, carbs: 15, fats: 18,
    image: 'https://images.unsplash.com/photo-1560717845-968823efbee1?q=80&w=500',
    ingredients: ['Carne vaca picada magra', 'Fatias de curgete', 'Molho tomate caseiro'],
    steps: ['Substituir a massa por fatias de curgete', 'Montar camadas e assar']
  },
  {
    id: '20',
    title: 'Carne de Porco à Alentejana Fit',
    category: 'Jantar',
    type: 'Ganhar',
    kcal: 720, protein: 55, carbs: 60, fats: 25,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500',
    ingredients: ['Lombo de porco', 'Ameijoas', 'Batata aos cubos (na airfryer)'],
    steps: ['Grelhar a carne marinada', 'Juntar as ameijoas', 'Servir com batata']
  },

  // ... Adicionando mais 20 receitas rapidamente para completar as 40
  { id: '21', title: 'Papas de Milho Proteicas', category: 'Pequeno-almoço', type: 'Ganhar', kcal: 510, protein: 28, carbs: 70, fats: 10, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=500', ingredients: ['Milho', 'Leite', 'Whey'], steps: ['Tradicional papa de milho com reforço proteico'] },
  { id: '22', title: 'Espetadas de Peru e Fruta', category: 'Lanche', type: 'Perder', kcal: 220, protein: 25, carbs: 15, fats: 4, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=500', ingredients: ['Peru', 'Abacaxi'], steps: ['Grelhar espetadas intercaladas'] },
  { id: '23', title: 'Caldo Verde com Chouriço de Aves', category: 'Jantar', type: 'Perder', kcal: 180, protein: 12, carbs: 20, fats: 5, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500', ingredients: ['Couve galega', 'Batata (pouca)', 'Cebola'], steps: ['Fazer base de legumes e juntar a couve fina'] },
  { id: '24', title: 'Massa com Gambas e Alho', category: 'Almoço', type: 'Ganhar', kcal: 580, protein: 35, carbs: 75, fats: 14, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500', ingredients: ['Massa integral', 'Camarão', 'Azeite'], steps: ['Cozer massa e saltear camarão'] },
  { id: '25', title: 'Ovos Mexidos com Farinheira Fit', category: 'Pequeno-almoço', type: 'Ganhar', kcal: 590, protein: 30, carbs: 40, fats: 32, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500', ingredients: ['3 Ovos', '20g Farinheira', 'Pão torrado'], steps: ['Mexer ovos com pedaços pequenos de farinheira'] },
  { id: '26', title: 'Polvo à Lagareiro (Batata Doce)', category: 'Almoço', type: 'Perder', kcal: 420, protein: 35, carbs: 25, fats: 18, image: 'https://images.unsplash.com/photo-1533630666243-7f618a800889?q=80&w=500', ingredients: ['Polvo', 'Batata doce', 'Alho'], steps: ['Assar polvo com alho e batata doce a murro'] },
  { id: '27', title: 'Hambúrguer de Feijão Preto', category: 'Jantar', type: 'Perder', kcal: 320, protein: 18, carbs: 40, fats: 7, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=500', ingredients: ['Feijão preto', 'Cebola', 'Coentros'], steps: ['Triturar feijão e moldar hambúrguer'] },
  { id: '28', title: 'Francesinha Integral Fit', category: 'Almoço', type: 'Ganhar', kcal: 890, protein: 65, carbs: 80, fats: 35, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500', ingredients: ['Pão integral', 'Bife', 'Queijo light', 'Molho caseiro'], steps: ['Montar camadas e cobrir com molho de tomate e cerveja'] },
  { id: '29', title: 'Pudim de Chia e Coco', category: 'Lanche', type: 'Perder', kcal: 210, protein: 8, carbs: 12, fats: 15, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500', ingredients: ['Chia', 'Leite coco', 'Coco ralado'], steps: ['Deixar repousar no frigorífico'] },
  { id: '30', title: 'Arroz de Marisco Proteico', category: 'Almoço', type: 'Ganhar', kcal: 610, protein: 48, carbs: 75, fats: 10, image: 'https://images.unsplash.com/photo-1512058560366-cd2429555e54?q=80&w=500', ingredients: ['Mix marisco', 'Arroz', 'Coentros'], steps: ['Arroz malandrinho com muita proteína do mar'] },
  { id: '31', title: 'Tosta de Frango e Abacate', category: 'Lanche', type: 'Ganhar', kcal: 490, protein: 30, carbs: 45, fats: 20, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500', ingredients: ['Frango desfiado', 'Abacate', 'Pão forma integral'], steps: ['Rechear o pão e tostar'] },
  { id: '32', title: 'Lombo de Porco com Ananás', category: 'Jantar', type: 'Perder', kcal: 340, protein: 38, carbs: 12, fats: 12, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500', ingredients: ['Lombo', 'Ananás grelhado'], steps: ['Grelhar ambos e servir juntos'] },
  { id: '33', title: 'Bolas de Proteína e Amendoim', category: 'Lanche', type: 'Ganhar', kcal: 320, protein: 15, carbs: 25, fats: 18, image: 'https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?q=80&w=500', ingredients: ['Manteiga amendoim', 'Aveia', 'Mel'], steps: ['Moldar bolas e refrigerar'] },
  { id: '34', title: 'Sopa de Peixe Rica', category: 'Jantar', type: 'Perder', kcal: 250, protein: 28, carbs: 15, fats: 6, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500', ingredients: ['Peixe variado', 'Camarão', 'Hortelã'], steps: ['Sopa limpa com pedaços de peixe'] },
  { id: '35', title: 'Bowl de Açaí e Paçoca Fit', category: 'Pequeno-almoço', type: 'Ganhar', kcal: 580, protein: 20, carbs: 85, fats: 15, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=500', ingredients: ['Açaí puro', 'Banana', 'Paçoca zero'], steps: ['Misturar e servir gelado'] },
  { id: '36', title: 'Filetes de Pescada no Forno', category: 'Almoço', type: 'Perder', kcal: 270, protein: 32, carbs: 10, fats: 8, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500', ingredients: ['Filetes', 'Limão', 'Salsa'], steps: ['Assar com pouco azeite em vez de fritar'] },
  { id: '37', title: 'Wrap de Ovo e Atum', category: 'Lanche', type: 'Perder', kcal: 240, protein: 26, carbs: 5, fats: 12, image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d4ec?q=80&w=500', ingredients: ['Ovo (como wrap)', 'Atum', 'Queijo creme light'], steps: ['Fazer uma omelete fina e enrolar o atum'] },
  { id: '38', title: 'Risoto de Cogumelos e Peru', category: 'Jantar', type: 'Ganhar', kcal: 620, protein: 40, carbs: 75, fats: 15, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=500', ingredients: ['Arroz arbóreo', 'Peru', 'Cogumelos'], steps: ['Cozinhar lentamente com caldo de legumes'] },
  { id: '39', title: 'Panquecas de Milho e Queijo', category: 'Pequeno-almoço', type: 'Perder', kcal: 280, protein: 18, carbs: 35, fats: 8, image: 'https://images.unsplash.com/photo-1528443338945-c120d93a0279?q=80&w=500', ingredients: ['Farinha milho', 'Queijo quark', 'Claras'], steps: ['Bater e dourar na frigideira'] },
  { id: '40', title: 'Salmão com Crosta de Sésamo', category: 'Almoço', type: 'Perder', kcal: 410, protein: 35, carbs: 5, fats: 28, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=500', ingredients: ['Salmão', 'Sésamo', 'Legumes grelhados'], steps: ['Passar o salmão por sésamo e selar'] }
];