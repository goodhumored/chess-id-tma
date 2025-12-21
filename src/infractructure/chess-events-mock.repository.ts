import ChessEvent from "../domain/chess-event";
import ChessEventsRepository, {
  ChessEventsQuery,
} from "../domain/chess-events-repository.interface";

// const randomPic =
//   ;

const eventsMock: ChessEvent[] = [
  new ChessEvent(
    1,
    "Турнир по быстрым шахматам",
    "tournament",
    new Date(),
    null,
    "ул. Пушкина, д. 10",
    "Это открытый турнир для игроков разного уровня, ориентированный на тех, кто хочет проверить свои силы в динамичном формате быстрых шахмат. Участников ждут несколько раундов по швейцарской системе, что позволяет сыграть с соперниками схожего рейтинга и получить качественный игровой опыт. Организаторы заранее подготовили комфортные столы, электронные часы и современную турнирную инфраструктуру. Перед началом участникам выдаются регламент, расписание и индивидуальные карточки игрока. Турнир станет хорошей возможностью попробовать новые дебюты, потренировать расчёт вариантов в условиях ограниченного времени и просто получить удовольствие от конкурентной атмосферы. Победителей ждут памятные призы, сертификаты и возможность повышения рейтинга клуба.",
    { id: 1, username: "organizer1", telegram_id: "123456" },
    { id: 1, name: "Москва" },
    20,
    100,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBd_tPl_Cpqh6rB9vu3SJkvVwrzduxsJ_q7rD5YqKikpNx9Vr_kHctae9_PUczloA7hV5JcczjmgDGzK2J452b-O9OvUWOIy4g3PRWOUGpFbiYuHWmFilq7DCla2FAeHapDIaGuab4SCnzMpYE0cjJwDhUG91ngjPVVvJBdA5-9HNKD8Yl2F8I0oTW25B9lyUlU0Mx056P7FHpV_9ve611QQN2_s4j2SahUA7LZ8hnxLWSbwNu4r2fHI7URFUOTi8xmd8uyrfnV_OM",
    "active",
    new Date(),
  ),
  new ChessEvent(
    2,
    "Тренировка для начинающих",
    "training",
    new Date(),
    null,
    "ул. Ленина, д. 5",
    "Это практическое занятие, специально созданное для тех, кто только делает первые шаги в шахматах или хочет укрепить базу. Тренировка включает объяснение ключевых принципов дебюта, развитие тактического зрения и понимание простейших эндшпильных позиций. Группа работает под руководством опытного тренера, который показывает примеры на демонстрационной доске, отвечает на вопросы участников и помогает каждому индивидуально. В рамках занятия ученики разыгрывают обучающие мини-партии, разбирают типичные ошибки новичков и получают конкретные рекомендации для самостоятельной практики. Формат идеально подходит тем, кто хочет быстро прогрессировать и чувствовать уверенность за доской.",
    { id: 2, username: "trainer1", telegram_id: "789012" },
    { id: 2, name: "Санкт-Петербург" },
    15,
    50,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBUhR2GyOnVTcwe7notf-yFfjrBCWvlI2Liy3nQ4Mh7fiicNjjOPEQ1YeE6ZZqxuOkGeA1e9u5_jRW7XLzGpGeHQCLm7khLWlLGWufBUANXzX_VrFt8VpCQwCnQoStOA7r73tCPT_OegAfP-FqNg_0wnu6pkaUByNFGHEKCDCQ62umYsNsQWtGYYz4Svm1bOOCfiA_Zjvh3ZX5reMBvQucF4EFTB3-zCvhIBzqgWr1tAwujmxe3MaQ7LWZrgEloeheE_znGrHw0Kys",
    "active",
    new Date(),
  ),
  new ChessEvent(
    3,
    "Встреча с гроссмейстером",
    "meeting",
    new Date(),
    null,
    "ул. Баумана, д. 20",
    "Это уникальное мероприятие, на котором участники смогут лично пообщаться с гроссмейстером, задать вопросы и получить редкие инсайты о профессиональной шахматной подготовке. Гость расскажет о своих карьерных этапах, подходах к анализу партий, тренировочных методиках и психологической подготовке к турнирам. В программе предусмотрена сеансная часть, где участники смогут сыграть короткие обучающие партии против мастера или разобрать собственные позиции. Также будет разбор знаменитых партий с объяснением стратегических идей и тонких тактических моментов. Мероприятие станет отличной возможностью расширить шахматное мышление, вдохновиться историей профессионала и получить советы, которые невозможно прочитать в учебниках.",
    { id: 3, username: "grandmaster", telegram_id: "345678" },
    { id: 3, name: "Казань" },
    30,
    80,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA1ZPKxOzOAa27CdhA_2EAbPRjRtKIkGD71_FfGpgEyPLEAQK7VSJ8Bx8PlkC2Ip4NaJc57RlxoNm-7vYK_D2LcIsVJ8LCV0R8NQCDCklOCwUdXlhb3EIr71YRMM2TRzTcdHi0U33lhBmfvlO7QD038JJRt4NeVKQdjoMvDRncPtCJT9QqRxkbcHfqkzKKbo-otsxP-UdK26w6iNX0PNKSI0PhVALOmd71JKKctrWwM8B9YoJJHpRL8Mc_dChv7LML-Wc1UL7YedSU",
    "active",
    new Date(),
  ),
];

export default class ChessEventsMockRepository
  implements ChessEventsRepository
{
  findEvents(query: ChessEventsQuery): Promise<ChessEvent[]> {
    return Promise.resolve(eventsMock).then((events) => {
      let filteredEvents = events;

      if (query.type) {
        filteredEvents = filteredEvents.filter(
          (event) => event.type === query.type,
        );
      }

      if (query.query) {
        const lowerQuery = query.query.toLowerCase();
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.title.toLowerCase().includes(lowerQuery) ||
            (event.description?.toLowerCase().includes(lowerQuery) ?? false) ||
            event.location.toLowerCase().includes(lowerQuery) ||
            event.city.name.toLowerCase().includes(lowerQuery) ||
            (event.organizer.username?.toLowerCase().includes(lowerQuery) ?? false),
        );
      }

      const skip = query.skip ?? 0;
      const limit = query.limit ?? filteredEvents.length;

      return filteredEvents.slice(skip, skip + limit);
    });
  }

  getById(id: string): Promise<ChessEvent | null> {
    const numericId = parseInt(id, 10);
    return Promise.resolve(
      eventsMock.find((event) => event.id === numericId) || null,
    );
  }
}
