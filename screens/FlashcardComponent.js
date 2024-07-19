

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
// import colors from '../colors';

// const FlashcardComponent = ({ question, onSubmitAnswer, previousAnswer }) => {
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [answer, setAnswer] = useState(previousAnswer || '');

//   const handlePress = () => {
//     setIsFlipped(!isFlipped);
//   };

//   const handleSubmit = () => {
//     onSubmitAnswer(question.id, answer);
//     setIsFlipped(false);
//   };

//   return (
//     <TouchableOpacity onPress={handlePress} style={[styles.card, previousAnswer ? styles.answered : {}]}>
//       {isFlipped ? (
//         previousAnswer ? (
//           <View style={styles.cardBack}>
//             <Text style={styles.answerText}>{previousAnswer}</Text>
//           </View>
//         ) : (
//           <View style={styles.cardBack}>
//             <TextInput
//               style={styles.input}
//               onChangeText={setAnswer}
//               value={answer}
//               placeholder="Type your answer"
//             />
//             <TouchableOpacity onPress={handleSubmit} style={styles.button}>
//               <Text style={styles.buttonText}>Submit</Text>
//             </TouchableOpacity>
//           </View>
//         )
//       ) : (
//         <View style={styles.cardFront}>
//           <Text style={styles.questionText}>{question.question}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     marginVertical: 10,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     elevation: 3,
//     minHeight: 150,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   answered: {
//     borderColor: colors.success,
//     borderWidth: 4,
//   },
//   cardFront: {
//     padding: 20,
//   },
//   cardBack: {
//     padding: 20,
//     alignItems: 'center',
//     width: '100%'
//   },
//   questionText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   answerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: colors.primary,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 20,
//     width: '100%',
//   },
//   button: {
//     backgroundColor: colors.primary,
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 20,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default FlashcardComponent;


import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import colors from '../colors';

const FlashcardComponent = ({ question, onSubmitAnswer, previousAnswer }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answer, setAnswer] = useState(previousAnswer || '');

  const handlePress = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmitAnswer(question.id, answer.trim());
    }
    setIsFlipped(false); // Optionally flip the card back
  };

  const cardStyle = [
    styles.card,
    previousAnswer ? styles.answered : null,
    isFlipped ? styles.flipped : null,
  ];

  return (
    <TouchableOpacity onPress={handlePress} style={cardStyle}>
      {isFlipped ? (
        <View style={styles.cardBack}>
          <TextInput
            style={styles.input}
            onChangeText={setAnswer}
            value={answer}
            placeholder="Type your answer"
            multiline
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardFront}>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  answered: {
    borderColor: colors.success, // Adjust this color to match your theme
    borderWidth: 4,
  },
  flipped: {
    backgroundColor: '#EFEFEF', // Optional: different background color for flipped state
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFront: {
    padding: 20,
  },
  cardBack: {
    padding: 20,
    alignItems: 'center',
    width: '100%'
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
    width: '100%',
    minHeight: 40,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FlashcardComponent;
