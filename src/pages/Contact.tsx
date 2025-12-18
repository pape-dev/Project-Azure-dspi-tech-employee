import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  Globe,
  Linkedin,
  Download,
} from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    content: "123 Avenue de l'Innovation\n75001 Paris, France",
  },
  {
    icon: Phone,
    title: "Téléphone",
    content: "+33 1 23 45 67 89",
  },
  {
    icon: Mail,
    title: "Email",
    content: "contact@dspi-tech.com",
  },
  {
    icon: Clock,
    title: "Horaires",
    content: "Lun - Ven: 9h00 - 18h00",
  },
];

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Globe, href: "#", label: "Website" },
];

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API (${response.status})`);
      }

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      toast({
        title: "Erreur lors de l'envoi",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${baseUrl}/api/contact`);
      if (!response.ok) {
        throw new Error(`Erreur API (${response.status})`);
      }

      const contacts = await response.json();

      if (contacts.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Il n'y a aucun contact à exporter.",
          variant: "destructive",
        });
        return;
      }

      // Créer le contenu CSV
      const headers = ["ID", "Nom", "Email", "Sujet", "Message", "Date de création"];
      const csvRows = [
        headers.join(","),
        ...contacts.map((contact: any) => {
          const row = [
            contact.id,
            `"${contact.name.replace(/"/g, '""')}"`,
            `"${contact.email.replace(/"/g, '""')}"`,
            `"${contact.subject.replace(/"/g, '""')}"`,
            `"${contact.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
            `"${new Date(contact.created_at).toLocaleString("fr-FR")}"`,
          ];
          return row.join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi !",
        description: `${contacts.length} contact(s) exporté(s) en CSV.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'export CSV :", error);
      toast({
        title: "Erreur lors de l'export",
        description: "Impossible d'exporter les contacts. Vérifiez l'API.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            Nous contacter
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Restons en <span className="gradient-text">Contact</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une question ? Un projet ? N'hésitez pas à nous contacter. 
            Notre équipe est là pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.title}
                  className="glass rounded-xl p-6 group hover:border-primary/50 transition-all duration-300 animate-slide-up"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {info.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Social Links */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Suivez-nous</h3>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-200"
                      title={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-6 md:p-8 animate-slide-up"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Envoyez-nous un message
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Sujet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2 mb-8">
                <Label htmlFor="message" className="text-sm font-medium">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Décrivez votre demande en détail..."
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  required
                  rows={6}
                  className="bg-secondary border-border focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
