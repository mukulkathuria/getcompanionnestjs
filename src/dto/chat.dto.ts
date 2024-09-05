export interface Chat {
    id: string;
    participants: string[];
    messages: Message[];
  }
  
  export interface Message {
    sender: string;
    content: string;
    timestamp: Date;
  }