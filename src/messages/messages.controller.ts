import { MessagesService } from './messages.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { errorHandler } from 'src/app/handlers/error.handler';

@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll() {
    try {
      return await this.messagesService.findAll();
    } catch (err) {
      errorHandler(err);
    } 
  }

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    try {
      return await this.messagesService.create(createMessageDto);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Patch(':messageID')
  async update(@Param('messageID', ParseIntPipe) messageID: number, @Body() updateMessageDto: UpdateMessageDto) {
    try {
      return await this.messagesService.update(messageID, updateMessageDto);
    } catch (err) {
      errorHandler(err);
    }
  }

}
