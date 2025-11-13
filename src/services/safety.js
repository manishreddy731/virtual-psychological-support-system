const SELF_HARM = [
  'kill myself','suicide','end my life','self harm','cutting',
  'overdose','i want to die','i dont want to live'
];
const HARM_OTHERS = ['kill them','hurt them','shoot','stab','revenge'];

export function screenRisk(text) {
  const t = (text || '').toLowerCase();
  const flags = [];
  if (SELF_HARM.some(k => t.includes(k))) flags.push('self_harm');
  if (HARM_OTHERS.some(k => t.includes(k))) flags.push('harm_others');
  if (/hopeless|worthless|can.t cope|panic attack/.test(t)) flags.push('distress');
  const crisis = flags.includes('self_harm') || flags.includes('harm_others');
  return { crisis, flags };
}
