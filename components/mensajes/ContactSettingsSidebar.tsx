"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Clock, ShieldCheck, Trash2, Archive, Volume2, Bot, Thermometer } from "lucide-react";
import { Contact, toggleContactIA } from "@/lib/conect-front";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useState } from "react";
import { toast } from "sonner";

interface ContactSettingsSidebarProps {
  contact?: Contact | null;
  sessionId?: string | null;
  userId?: string | null;
  isMobile?: boolean;
}

export function ContactSettingsSidebar({
  contact,
  sessionId,
  userId,
  isMobile = false,
}: ContactSettingsSidebarProps) {
  const { updateContactData } = useContacts(sessionId || null);
  const { updateWaitingMessagesForPhone } = useMessages(sessionId || null, contact?.id_contac || contact?.id || null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleIA = async (enabled: boolean) => {
    if (!contact?.phone) return;

    setIsUpdating(true);
    try {
      const result = await toggleContactIA(contact.phone, enabled);
      toast.success(result.message);
      // Update local contact state to reflect the change
      if (contact) {
        contact.ia = enabled;
      }
    } catch (error) {
      console.error('Error toggling IA:', error);
      toast.error('No se pudo actualizar el estado de IA');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateWaitingMessages = async () => {
    if (!contact?.phone) return;

    setIsUpdating(true);
    try {
      await updateWaitingMessagesForPhone(contact.phone);
    } catch (error) {
      console.error('Error updating waiting messages:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const displayContact = contact ? {
    name: contact.nombre_completo,
    phone: contact.phone,
    estado: contact.estado,
    ia: contact.ia,
    registrado: contact.registrado,
    fecha: contact.fecha,
  } : null;

  const desktopContent = contact ? (
    <div className="flex h-full w-64 flex-col border-l bg-background p-4">
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-user.jpg" alt={displayContact?.name || 'Contact'} />
          <AvatarFallback>
            {displayContact?.name?.split(" ").map(n => n[0]).join("") || 'U'}
          </AvatarFallback>
        </Avatar>
        {displayContact?.registrado && <ShieldCheck className="text-green-500 h-5 w-5" />}
        <div className="text-center">
          <h2 className="font-semibold">{displayContact?.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            {displayContact?.estado && (
              <Badge variant={
                displayContact.estado === 'caliente' ? 'default' :
                displayContact.estado === 'tibio' ? 'secondary' : 'outline'
              }>
                <Thermometer className="h-3 w-3 mr-1" />
                {displayContact.estado}
              </Badge>
            )}
            {displayContact?.ia && (
              <Badge variant="outline">
                <Bot className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{displayContact?.phone || 'Sin teléfono'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Registrado {displayContact?.fecha ? new Date(displayContact.fecha).toLocaleDateString() : 'Desconocido'}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Contact Management */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Estado del Lead</Label>
          <Select
            value={displayContact?.estado || 'frio'}
            onValueChange={async (value) => {
              if (!contact?.id_contac || !userId) return;

              setIsUpdating(true);
              try {
                const updatedContact = await updateContactData(userId, contact.id_contac, { estado: value as 'frio' | 'tibio' | 'caliente' });
                toast.success(`Estado actualizado a ${value}`);
                // Update local contact state to reflect the change
                if (contact) {
                  contact.estado = value as 'frio' | 'tibio' | 'caliente';
                }
              } catch (error) {
                console.error('Error updating status:', error);
                toast.error('No se pudo actualizar el estado del contacto');
              } finally {
                setIsUpdating(false);
              }
            }}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frio">❄️ Frío</SelectItem>
              <SelectItem value="tibio">🌡️ Tibio</SelectItem>
              <SelectItem value="caliente">🔥 Caliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Respuestas IA</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleIA(!displayContact?.ia)}
            disabled={isUpdating || !userId}
          >
            {displayContact?.ia ? 'Desactivar' : 'Activar'}
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleUpdateWaitingMessages}
          disabled={isUpdating}
        >
          Actualizar Mensajes en Espera
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2 mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm">Silenciar notificaciones</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Archive className="h-4 w-4" />
          <span className="text-sm">Archivar chat</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="text-sm">Eliminar chat</span>
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex h-full w-64 flex-col border-l bg-background p-4">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4" />
          <p>Selecciona un contacto para ver detalles</p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="hidden">
        {/* Mobile contact settings - placeholder for now */}
        {desktopContent}
      </div>
    );
  }

  return desktopContent;
}