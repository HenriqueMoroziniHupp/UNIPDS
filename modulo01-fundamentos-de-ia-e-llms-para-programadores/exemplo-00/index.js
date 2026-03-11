import tf from '@tensorflow/tfjs-node';

async function trainModel(inputXs, outputYs) {
  const model = tf.sequential()

  // Primeira camada da rede
  // Entrada 7 Posicoes (idade normalizada + 3 cores + 3 cidades)
  // Vamos criar 80 neuronios 
  model.add(tf.layers.dense({ inputShape: [7], units: 80, activation: 'relu' }))

  // Saida = 3, uma para cada categoria
  // 'softmax' categoriza a saida em probabilidade
  model.add(tf.layers.dense({ units: 3, activation: 'softmax'} ))

  // Compilando modelo
  // ADAM - Adaptative Moment Estimation)
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  })

  // Treinando o modelo
  await model.fit(inputXs, outputYs, {
    verbose: 0,
    epochs: 100,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, log) => console.log(`Epoch: ${epoch}: Loss: ${log.loss}`)
    }
  })

  return model
}

async function predict(model, pessoa) {
  //  Transformar o array JS para o tensor (tfjs)
  const tfInput = tf.tensor2d(pessoa)

  // Faaz a perdição. (Output sera um vetor de 3 probabilidade)
  const pred = model.predict(tfInput)
  const predArray = await pred.array()
  return predArray[0].map((prob, index) => ({ prob, index }))
}

// Exemplo de pessoas para treino (cada pessoa com idade, cor e localização)
// const pessoas = [
//     { nome: "Erick", idade: 30, cor: "azul", localizacao: "São Paulo" },
//     { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
//     { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" }
// ];

// Vetores de entrada com valores já normalizados e one-hot encoded
// Ordem: [idade_normalizada, azul, vermelho, verde, São Paulo, Rio, Curitiba]
// const tensorPessoas = [
//     [0.33, 1, 0, 0, 1, 0, 0], // Erick
//     [0,    0, 1, 0, 0, 1, 0],    // Ana
//     [1,    0, 0, 1, 0, 0, 1]     // Carlos
// ]

// Usamos apenas os dados numéricos, como a rede neural só entende números.
// tensorPessoasNormalizado corresponde ao dataset de entrada do modelo.
const tensorPessoasNormalizado = [
    [0.33, 1, 0, 0, 1, 0, 0], // Erick
    [0,    0, 1, 0, 0, 1, 0],    // Ana
    [1,    0, 0, 1, 0, 0, 1]     // Carlos
]

// Labels das categorias a serem previstas (one-hot encoded)
// [premium, medium, basic]
const labelsNomes = ["premium", "medium", "basic"]; // Ordem dos labels
const tensorLabels = [
  [1, 0, 0], // premium - Erick
  [0, 1, 0], // medium - Ana
  [0, 0, 1]  // basic - Carlos
];

// Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
const inputXs = tf.tensor2d(tensorPessoasNormalizado)
const outputYs = tf.tensor2d(tensorLabels)

// inputXs.print();
// outputYs.print();

// quanto mais dados, melhor !
// assim o algoritimo consegue entender melhor os padroes complexos dos dados
const model = await trainModel(inputXs, outputYs)

const pessoa = { nome: 'Zé', idade: 28, cor: 'verde', localizacao: "Curitiba" }
// Normalizando a idade da nova pessoa usando o mesmo padrão do treino
// Exemplo: idade_min = 25, idade_max = 40, então (28 - 25) / (40 - 25 ) = 0.2

const pessoaTensorNormalizado = [
  [
    0.2, // idade normalizada
    1,    // cor azul
    0,    // cor vermelho
    0,    // cor verde
    0,    // localização São Paulo
    1,    // localização Rio
    0     // localização Curitiba
  ]
]

const predictions = await predict(model, pessoaTensorNormalizado)

const result = predictions
  .sort((a,b) => b.prob - a.prob)
  .map(p => `${labelsNomes[p.index]} (${(p.prob * 100).toFixed(2)}%)`)
  .join('\n')

console.log("🚨 result", result);