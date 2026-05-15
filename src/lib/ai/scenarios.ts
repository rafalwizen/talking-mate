import type { Scenario } from '@/types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'restaurant',
    title: { en: 'At a Restaurant', de: 'Im Restaurant', es: 'En un restaurante' },
    description: {
      en: 'Order food, ask about the menu, and interact with a waiter.',
      de: 'Essen bestellen, nach der Speisekarte fragen und mit einem Kellner interagieren.',
      es: 'Pedir comida, preguntar sobre el menú e interactuar con un camarero.',
    },
    systemPromptAddition:
      'You are a waiter at a restaurant. The user is a customer. Guide the conversation through greeting, ordering drinks, ordering food, asking about the menu, and getting the bill.',
  },
  {
    id: 'airport',
    title: { en: 'At the Airport', de: 'Am Flughafen', es: 'En el aeropuerto' },
    description: {
      en: 'Check in, go through security, and find your gate.',
      de: 'Einchecken, durch die Sicherheitskontrolle gehen und das Gate finden.',
      es: 'Facturar, pasar por seguridad y encontrar tu puerta.',
    },
    systemPromptAddition:
      'You are airport staff. Guide the conversation through check-in, security, gate information, and boarding.',
  },
  {
    id: 'hotel',
    title: { en: 'At a Hotel', de: 'Im Hotel', es: 'En un hotel' },
    description: {
      en: 'Check in, ask about amenities, and request services.',
      de: 'Einchecken, nach Annehmlichkeiten fragen und Services anfordern.',
      es: 'Registrarse, preguntar sobre servicios y solicitar asistencia.',
    },
    systemPromptAddition:
      'You are a hotel receptionist. Guide the conversation through checking in, amenities, requesting services, and checking out.',
  },
  {
    id: 'small-talk',
    title: { en: 'Small Talk', de: 'Kleingespräch', es: 'Charla casual' },
    description: {
      en: 'Casual conversation about hobbies, work, and travel.',
      de: 'Entspanntes Gespräch über Hobbys, Arbeit und Reisen.',
      es: 'Conversación casual sobre pasatiempos, trabajo y viajes.',
    },
    systemPromptAddition:
      'You just met the user at a social event. Have a casual conversation about introductions, hobbies, work, and travel.',
  },
  {
    id: 'shopping',
    title: { en: 'Shopping', de: 'Einkaufen', es: 'De compras' },
    description: {
      en: 'Browse products, ask prices, and make purchases.',
      de: 'Produkte ansehen, nach Preisen fragen und einkaufen.',
      es: 'Ver productos, preguntar precios y realizar compras.',
    },
    systemPromptAddition:
      'You are a shop assistant in a clothing store. Help the user browse products, ask about sizes and prices, and complete purchases.',
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
