import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, ChatResponseDto } from './dto/chat.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot response',
    type: ChatResponseDto,
  })
  async chat(@Body() dto: ChatMessageDto): Promise<ChatResponseDto> {
    return await this.chatbotService.processMessage(dto);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get trip details for chatbot context' })
  async getTripDetails(@Param('tripId') tripId: string) {
    return await this.chatbotService.getTripDetails(tripId);
  }

  @Post('confirm-payment')
  @ApiOperation({ summary: 'Confirm payment status after QR code payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmation result',
  })
  async confirmPayment(@Body() body: { orderCode: number }) {
    return await this.chatbotService.confirmPayment(body.orderCode);
  }
}
